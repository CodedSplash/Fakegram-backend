ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM deps AS source
COPY tsconfig.json tsconfig.build.json nest-cli.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate

FROM source AS development
ENV NODE_ENV=development
EXPOSE 8080 9229
CMD ["npx", "nest", "start", "--watch"]

FROM source AS migrator
ENV NODE_ENV=production
COPY docker/app/migrate.sh /usr/local/bin/migrate.sh
CMD ["sh", "/usr/local/bin/migrate.sh"]

FROM source AS build
RUN npm run build

FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

FROM node:${NODE_VERSION}-bookworm-slim AS production
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8080
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
USER node
EXPOSE 8080
STOPSIGNAL SIGTERM
CMD ["node", "dist/src/main.js"]
