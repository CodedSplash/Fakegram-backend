# Docker: dev и prod окружения

## Состав

| Сервис | dev | prod | Назначение |
|--------|-----|------|------------|
| `redis` | 1 узел, без пароля, порт `6379` | пароль обязателен, AOF, без портов наружу | кеш профилей |
| `kafka` | 1 KRaft-узел (broker+controller), порт `9094` для хоста | 3 KRaft-узла, RF=3, min ISR=2 | события `follow` / CDC |
| `kafka-init` | создаёт топики из `KAFKA_TOPICS` | то же, RF=3 | одноразовый |
| `kafka-connect` | Debezium Connect, порт `8083` | без портов наружу | Kafka Connect + Debezium |
| `debezium-init` | регистрирует коннекторы из `docker/debezium/connectors/*.json` | то же | одноразовый, идемпотентный (`PUT /connectors/{name}/config`) |
| `migrate` | `prisma migrate deploy` | то же | одноразовый, ретраи до готовности БД |
| `app` | `nest start --watch`, debug `9229`, hot reload | собранный `dist`, `node` user, порт на `127.0.0.1` | NestJS |
| `kafka-ui` | `http://localhost:8085` | — | просмотр топиков/коннекторов |

PostgreSQL в этот compose **не входит** — он поднимается кластером Patroni из репозитория
`patroni-fakegram` (папка `fakegram/`). Связь — через внешнюю docker-сеть `fakegram-db-network`,
хост БД — `pg-haproxy:5000`.

## Порядок запуска

```bash
# 1. PostgreSQL (Patroni)
cd ../patroni-fakegram/fakegram
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# 2. Backend
cd ../../Fakegram-backend
npm run docker:dev            # всё, включая приложение в контейнере
# или
npm run docker:dev:infra      # только Redis/Kafka/Connect, приложение запускается локально:
cp .env.example .env          # DATABASE_URL -> localhost:5000, KAFKA_BROKERS -> localhost:9094
npm run start:dev
```

Prod:

```bash
cp .env.docker.prod.example .env.docker.prod   # заполнить секреты
npm run docker:prod
```

В prod-режиме compose откажется стартовать, если не заданы `POSTGRES_PASSWORD`, `REDIS_PASSWORD`,
`DEBEZIUM_DB_PASSWORD`, `KAFKA_CLUSTER_ID` и JWT-секреты.

Пароли `POSTGRES_PASSWORD`/`DEBEZIUM_DB_PASSWORD` должны совпадать с `APP_DB_PASSWORD`/`DEBEZIUM_DB_PASSWORD`
в `.env` кластера Patroni. `POSTGRES_PASSWORD` подставляется в URL, поэтому не используйте в нём
символы `@ : / ? # %` (или URL-кодируйте их).

## Скрипты

| npm script | Что делает |
|------------|-----------|
| `docker:dev` / `docker:dev:down` / `docker:dev:logs` | dev-окружение целиком |
| `docker:dev:infra` | только инфраструктура для локального запуска приложения |
| `docker:prod` / `docker:prod:down` / `docker:prod:logs` | prod-окружение |
| `prisma:generate`, `prisma:migrate:deploy` | Prisma CLI |

## Transactional Outbox + Debezium

Приложение не отправляет события в Kafka напрямую. Репозиторий в **одной транзакции** пишет изменение
бизнес-таблицы и строку в `outbox_events`:

| Колонка | Значение для подписок |
|---------|-----------------------|
| `aggregatetype` | `follow` → имя топика |
| `aggregateid` | `followerId_followingId` → ключ сообщения (порядок событий одной пары) |
| `type` | `follow` / `unfollow` → заголовок `eventType` |
| `payload` | `{ id, followerId, followingId, createdAt }` → тело сообщения |

Коннектор `docker/debezium/connectors/fakegram-postgres.json` читает только `public.outbox_events`
(слот `debezium_fakegram`, публикация `dbz_publication`), а SMT `EventRouter` раскладывает строки по топикам
по `aggregatetype`. Новый тип событий = новая вставка в outbox с другим `aggregatetype`, коннектор менять не нужно.

Строка outbox удаляется в той же транзакции сразу после вставки: Debezium читает INSERT из WAL,
`EventRouter` игнорирует DELETE, поэтому таблица всегда пустая и не требует фоновой очистки.

Секреты в JSON не хранятся — подставляются через `EnvVarConfigProvider` (`${env:DEBEZIUM_DB_PASSWORD}`).
После изменения JSON: `docker compose ... run --rm debezium-init`.

### Публикация `dbz_publication`

Пустую публикацию создаёт `init-db.sh` кластера Patroni (владелец — пользователь приложения), миграция
`20261015120200_create_debezium_publication` добавляет в неё `outbox_events` с `publish = 'insert'`.
Публикация обязана существовать раньше любого DML: постоянный слот Patroni декодирует WAL с момента создания
и падает с `publication "dbz_publication" does not exist` на изменениях, записанных до её появления. Коннектор работает с `publication.autocreate.mode=disabled`, поэтому `debezium-init`
ждёт завершения `migrate`. Слот `debezium_fakegram` — постоянный, его создаёт Patroni.

Окружения, поднятые старым `init-db.sh` (публикация `FOR ALL TABLES`), миграция через `ALTER` не исправит —
один раз удалить публикацию суперпользователем до `migrate`:

1. Остановить `app` и коннектор (`DELETE :8083/connectors/fakegram-postgres` или `PUT .../pause`).
2. `DROP PUBLICATION dbz_publication;` под `postgres`.
3. `prisma migrate deploy`, затем `run --rm debezium-init`.
4. Если коннектор падает с `publication "dbz_publication" does not exist` (слот читает WAL, записанный
   до пересоздания), при остановленном приложении сдвинуть слот:
   `SELECT pg_replication_slot_advance('debezium_fakegram', pg_current_wal_lsn());`

Проверка:

```sql
SELECT pubname, puballtables, pubinsert, pubupdate, pubdelete FROM pg_publication;  -- puballtables = f, только pubinsert
SELECT * FROM pg_publication_tables WHERE pubname = 'dbz_publication';             -- только outbox_events
SELECT slot_name, active, wal_status, confirmed_flush_lsn FROM pg_replication_slots;
```

### Потребитель подписок: повторы и DLQ

`FollowConsumer` (группа `follow-counters`) применяет пачки событий к счётчикам:

- временная ошибка БД (недоступна, таймаут, deadlock) — до 5 повторов с экспоненциальной задержкой, затем
  ошибка пробрасывается, offset не коммитится, kafkajs перезапускает consumer;
- постоянная ошибка — пачка делится пополам, пока не останется одно событие; оно после 5 попыток уходит
  в `follow.dlq`, остальные применяются;
- невалидное сообщение сразу уходит в `follow.dlq`.

В DLQ сообщение попадает без изменений, причина — в заголовках `x-original-topic`, `x-original-partition`,
`x-original-offset`, `x-error-class`, `x-error-message`, `x-attempts`, `x-failed-at`. Retention DLQ — 30 дней
(`KAFKA_TOPICS=follow:3,follow.dlq:3:2592000000`, формат `name[:partitions[:retention.ms]]`).

#### Переотправка из DLQ

CLI `src/infrastructure/kafka/scripts/replayDlq.ts` (собирается `npm run build`, в приложение не импортируется)
читает DLQ с offset группы `follow-dlq-replay` (при первом запуске — с начала) до high watermark на момент
старта и отправляет сообщения в `x-original-topic` (иначе — имя DLQ без `.dlq`) с тем же ключом, телом и
исходными заголовками: `x-*`-диагностика удаляется, добавляются `x-replayed-at` и `x-replay-count`.

```bash
npm run kafka:dlq:replay                                  # dry-run: только список, ничего не шлёт и не коммитит
npm run kafka:dlq:replay -- --filter-error "Invalid" --limit 10
npm run kafka:dlq:replay:execute                          # отправка (acks=all), offset DLQ коммитится после неё
npm run kafka:dlq:replay -- --help                        # --topic, --group, --from-offset 0|p:o,...
```

Брокеры — `KAFKA_BROKERS` (по умолчанию `localhost:9094`). Для событий старше `--older-than-warning-days`
(по умолчанию 8) выводится предупреждение: `processed_events` их уже не дедуплицирует. С `--filter-error`
offset не коммитится дальше первого пропущенного сообщения партиции, поэтому отправленные после него
сообщения при следующем запуске уйдут повторно (дубли отсечёт `processed_events`).

### Чистка `processed_events`

`ProcessedEventsCleanupJob` раз в час удаляет записи старше `PROCESSED_EVENTS_RETENTION_DAYS` (по умолчанию 8 —
retention топика `follow` 7 дней + запас) порциями по 5000. Событие из DLQ, переотправленное позже этого срока,
дедупликацией уже не отсекается.

## Dockerfile

Многостадийный: `deps` → `source` (prisma generate) → `development` / `migrator` / `build`; `prod-deps` (`npm ci --omit=dev`) → `production`
(только prod-зависимости, `dist`, запуск от `node`).
