# Docker: dev и prod окружения

## Состав

| Сервис | dev | prod | Назначение |
|--------|-----|------|------------|
| `redis` | 1 узел, без пароля, порт `6379` | пароль обязателен, AOF, без портов наружу | счётчики подписок |
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

## Dockerfile

Многостадийный: `deps` → `source` (prisma generate) → `development` / `migrator` / `build`; `prod-deps` (`npm ci --omit=dev`) → `production`
(только prod-зависимости, `dist`, запуск от `node`).
