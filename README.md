<div align="center">

# Fakegram Backend

Учебный проект, повторяющий функциональность Instagram. Серверная часть на NestJS в стиле Clean Architecture.

![Node.js](https://img.shields.io/badge/Node.js-24-5FA04E?logo=nodedotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17%20%2B%20Patroni-4169E1?logo=postgresql&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Kafka-KRaft-231F20?logo=apachekafka&logoColor=white)
![Debezium](https://img.shields.io/badge/Debezium-3.2-8CC04D)
![Redis](https://img.shields.io/badge/Redis-7.4-FF4438?logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

## Содержание

- [Возможности](#возможности)
- [Стек](#стек)
- [Архитектура](#архитектура)
- [Структура проекта](#структура-проекта)
- [Быстрый старт](#быстрый-старт)
- [Переменные окружения](#переменные-окружения)
- [Скрипты](#скрипты)
- [API](#api)
- [Связанные репозитории](#связанные-репозитории)
- [Лицензия](#лицензия)

## Возможности

- Регистрация и вход, пароли в argon2id (старые HMAC-хеши перехешируются при входе)
- JWT: access-токен и refresh-токен в httpOnly-cookie; в БД хранится только SHA-256 refresh-токена,
  ротация атомарная, повторное использование старого токена отзывает сессию; выход. Версия токенов
  пользователя (кеш в Redis) мгновенно отзывает выданные access-токены после смены пароля, username и выхода
- Профиль: публичный профиль со счётчиками (кеш в Redis), свой профиль, редактирование,
  смена пароля, username и email, деактивация (вход восстанавливает аккаунт) и удаление аккаунта
  (подписки удаляются с пересчётом счётчиков)
- Подписки и отписки: события через Transactional Outbox + Debezium, счётчики обновляет потребитель Kafka
  (дедупликация, повторы, DLQ), списки подписчиков/подписок с курсорной пагинацией
- Приватные аккаунты: подписка через заявку (принять / отклонить / отменить), при открытии аккаунта
  заявки принимаются автоматически; списки видят только владелец и его подписчики
- Блокировки: снимают подписки и заявки в обе стороны, запрещают подписку и скрывают пользователей
  друг от друга в списках; неактивные пользователи скрыты
- Rate limiting (секунда, 10 секунд, минута), более строгий для подписок
- CORS для фронтенда, Swagger-документация в dev-режиме

## Стек

| Область | Технологии |
|---------|------------|
| Приложение | NestJS 12, TypeScript 6, class-validator, Swagger, argon2 (`@node-rs/argon2`) |
| База данных | PostgreSQL 17 в HA-кластере Patroni (etcd + HAProxy), Prisma 7 с `@prisma/adapter-pg` |
| События | Apache Kafka (KRaft), Kafka Connect + Debezium, kafkajs |
| Кэш | Redis 7.4 (ioredis) |
| Инфраструктура | Docker, Docker Compose (dev / prod) |

## Архитектура

Код разделён на слои Clean Architecture, зависимости направлены внутрь:

| Слой | Каталог | Ответственность |
|------|---------|-----------------|
| Domain | `src/domain` | сущности, value objects, интерфейсы репозиториев |
| Application | `src/application` | use cases |
| Infrastructure | `src/infrastructure` | Prisma, Redis, Kafka, мапперы, реализации репозиториев |
| Presentation | `src/presentation` | контроллеры, DTO, guards, фильтры, Swagger |

### Transactional Outbox

События не отправляются в Kafka из кода приложения. Репозиторий в одной транзакции изменяет бизнес-таблицу
и записывает событие в `outbox_events`. Debezium читает WAL PostgreSQL, а SMT `EventRouter` публикует событие
в топик, указанный в `aggregatetype`. Строка outbox удаляется в той же транзакции, поэтому таблица не растёт.

```mermaid
flowchart LR
    Client -->|HTTP| App[NestJS]
    App -->|"BEGIN: follows + outbox_events COMMIT"| HAProxy
    HAProxy --> PG[(PostgreSQL<br/>Patroni leader)]
    PG -->|WAL / pgoutput| Debezium[Kafka Connect<br/>Debezium]
    Debezium -->|EventRouter| Kafka[(Kafka<br/>topic: follow)]
    Kafka --> Consumer[FollowConsumer<br/>счётчики подписок]
    Consumer --> HAProxy
    Consumer -->|сброс кеша профиля| Redis
    Kafka -.->|ошибки| DLQ[(follow.dlq)]
    App <--> Redis[(Redis)]
```

Формат события в топике `follow`:

| Часть сообщения | Значение |
|-----------------|----------|
| ключ | `followerId_followingId` |
| заголовок `eventType` | `follow` / `unfollow` |
| заголовок `id` | UUID события, для дедупликации на стороне потребителя |
| значение | `{ "id", "followerId", "followingId", "createdAt" }` |

## Структура проекта

```text
.
├── docker/                  # скрипты init-контейнеров и конфигурация коннекторов Debezium
│   ├── app/                 # prisma migrate deploy с ретраями
│   ├── debezium/            # регистрация коннекторов, connectors/*.json
│   └── kafka/               # создание топиков
├── docs/
│   └── DOCKER.md            # подробное описание docker-окружений
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── application/
│   ├── domain/
│   ├── infrastructure/
│   ├── presentation/
│   ├── app.module.ts
│   └── main.ts
├── docker-compose.yml       # общая часть
├── docker-compose.dev.yml   # dev: hot reload, debug, Kafka UI, порты наружу
├── docker-compose.prod.yml  # prod: 3 брокера Kafka, секреты обязательны
└── Dockerfile               # multi-stage: development / migrator / production
```

## Быстрый старт

### Требования

- Docker с Compose v2
- Node.js 24 и npm 11 (для локального запуска без контейнера)
- Запущенный кластер PostgreSQL из [patroni-fakegram](https://github.com/CodedSplash/patroni-fakegram)

### 1. PostgreSQL

```bash
git clone https://github.com/CodedSplash/patroni-fakegram.git
cd patroni-fakegram/fakegram
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

Кластер создаёт docker-сеть `fakegram-db-network`, базу `fakegram`, роли приложения и Debezium.

### 2. Backend в Docker

```bash
git clone https://github.com/CodedSplash/Fakegram-backend.git
cd Fakegram-backend
npm run docker:dev
```

| Сервис | Адрес |
|--------|-------|
| API | http://localhost:8080 |
| Swagger | http://localhost:8080/swagger |
| Node.js debugger | localhost:9229 |
| Kafka UI | http://localhost:8085 |
| Kafka Connect REST | http://localhost:8083 |

### 3. Backend локально, инфраструктура в Docker

```bash
npm ci
cp .env.example .env
npm run docker:dev:infra
npm run prisma:generate
npm run prisma:migrate:deploy
npm run start:dev
```

### Production

```bash
cp .env.docker.prod.example .env.docker.prod
npm run docker:prod
```

Compose не запустится, пока в `.env.docker.prod` не заданы пароли, `KAFKA_CLUSTER_ID` и JWT-секреты.
Подробности — в [docs/DOCKER.md](docs/DOCKER.md).

## Переменные окружения

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `PORT` | `8080` | порт HTTP-сервера |
| `MODE_ENV` | — | `dev`: подробные ошибки в ответах, Swagger, refresh-cookie без `secure` |
| `CORS_ORIGINS` | `http://localhost:3000` | разрешённые origin фронтенда через запятую (`*` запрещён) |
| `SWAGGER_ENABLED` | `false` | включить Swagger вне dev-режима |
| `DATABASE_URL` | — | строка подключения PostgreSQL (через HAProxy, порт `5000`) |
| `DATABASE_POOL_MAX` | `10` | размер пула соединений |
| `REDIS_URL` | — | строка подключения Redis, имеет приоритет над `REDIS_*` |
| `REDIS_HOST` / `REDIS_PORT` | `localhost` / `6379` | адрес Redis |
| `REDIS_PASSWORD` / `REDIS_USERNAME` / `REDIS_DB` | — / — / `0` | авторизация и номер БД Redis |
| `KAFKA_BROKERS` | `localhost:9094` | брокеры Kafka через запятую |
| `KAFKA_CLIENT_ID` | `fakegram-backend` | client id Kafka |
| `PROCESSED_EVENTS_RETENTION_DAYS` | `8` | срок хранения id обработанных событий (≥ retention топика `follow`) |
| `SECRET_PASSWORD_KEY` | — | ключ старых HMAC-хешей паролей; нужен, пока в БД остались такие хеши |
| `SECRET_ACCESS_JWT_KEY` | — | секрет access-токена |
| `SECRET_REFRESH_JWT_KEY` | — | секрет refresh-токена |

Шаблоны: `.env.example` (локальный запуск), `.env.docker.dev`, `.env.docker.prod.example`.

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run start:dev` | запуск с hot reload |
| `npm run start:debug` | запуск с отладчиком |
| `npm run build` / `npm run start:prod` | сборка и запуск production-сборки |
| `npm run lint` / `npm run format` | ESLint и Prettier |
| `npm test` | запуск тестов (Jest) |
| `npm run prisma:generate` | генерация Prisma Client |
| `npm run prisma:migrate:deploy` | применение миграций |
| `npm run docker:dev` / `docker:dev:down` / `docker:dev:logs` | dev-окружение в Docker |
| `npm run docker:dev:infra` | только Redis, Kafka, Kafka Connect, Kafka UI |
| `npm run docker:prod` / `docker:prod:down` / `docker:prod:logs` | prod-окружение в Docker |
| `npm run kafka:dlq:replay` / `kafka:dlq:replay:execute` | просмотр / повторная отправка сообщений из `follow.dlq` (после `npm run build`) |

## API

Полная спецификация доступна в Swagger: `/swagger` (в dev-режиме или при `SWAGGER_ENABLED=true`).

| Метод | Путь | Авторизация | Описание |
|-------|------|:-----------:|----------|
| `POST` | `/auth/registration` | — | регистрация |
| `POST` | `/auth/login` | — | вход |
| `PUT` | `/jwt/refresh_token` | cookie `refreshToken` | обновление пары токенов |
| `POST` | `/jwt/logout` | Bearer | выход, отзыв refresh-токена |
| `GET` | `/user/has_user/:username` | — | проверка существования пользователя |
| `GET` | `/user/:username/profile` | — | публичный профиль со счётчиками |
| `GET` | `/user/me` | Bearer | свой профиль |
| `PATCH` | `/user/me` | Bearer | изменение displayName, bio, websiteUrl, gender, isPrivate |
| `PUT` | `/user/me/password` | Bearer | смена пароля, другие сессии завершаются |
| `PATCH` | `/user/me/username` | Bearer | смена username (с паролем), выдаёт новые токены |
| `PATCH` | `/user/me/email` | Bearer | смена email (с паролем) |
| `POST` | `/user/me/deactivate` | Bearer | деактивация, в теле `currentPassword`; вход с паролем восстанавливает |
| `DELETE` | `/user/me` | Bearer | удаление аккаунта, в теле `currentPassword` |
| `POST` | `/user/follow` | Bearer | подписка; на закрытый аккаунт — заявка (`status: requested`) |
| `POST` | `/user/unfollow` | Bearer | отписка |
| `GET` | `/user/:id/followers` | Bearer | подписчики, `?limit=&cursor=` |
| `GET` | `/user/:id/followings` | Bearer | подписки, `?limit=&cursor=` |
| `GET` | `/user/:id/is_following` | Bearer | статус подписки: `none` / `requested` / `following` |
| `GET` | `/user/me/follow_requests` | Bearer | входящие заявки, `?limit=&cursor=` |
| `POST` | `/user/me/follow_requests/:requesterId/accept` | Bearer | принять заявку |
| `POST` | `/user/me/follow_requests/:requesterId/reject` | Bearer | отклонить заявку |
| `DELETE` | `/user/follow_requests/:targetId` | Bearer | отменить свою заявку |
| `POST` | `/user/:id/block` | Bearer | заблокировать пользователя |
| `DELETE` | `/user/:id/block` | Bearer | разблокировать |
| `GET` | `/user/me/blocks` | Bearer | мои блокировки, `?limit=&cursor=` |

## Связанные репозитории

| Репозиторий | Назначение |
|-------------|------------|
| [Fakegram-frontend](https://github.com/CodedSplash/Fakegram-frontend) | клиент на Next.js |
| [patroni-fakegram](https://github.com/CodedSplash/patroni-fakegram) | HA-кластер PostgreSQL (Patroni, etcd, HAProxy) |

## Лицензия

[MIT](LICENSE) © 2024-2026 Ivan Shchukin
