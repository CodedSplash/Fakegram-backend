import { FactoryProvider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

export const REDIS_SERVICE = Symbol('REDIS_SERVICE');
export const REDIS_CONFIG_OPTIONS = Symbol('REDIS_CONFIG_OPTIONS');

const buildRedisOptions = (configService: ConfigService): RedisOptions => ({
  host: configService.get<string>('REDIS_HOST', 'localhost'),
  port: Number(configService.get<string>('REDIS_PORT', '6379')),
  username: configService.get<string>('REDIS_USERNAME') || undefined,
  password: configService.get<string>('REDIS_PASSWORD') || undefined,
  db: Number(configService.get<string>('REDIS_DB', '0')),
  keyPrefix: configService.get<string>('REDIS_KEY_PREFIX') || undefined,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 200, 5000),
});

export const RedisFactory: FactoryProvider = {
  provide: REDIS_SERVICE,
  useFactory: (configService: ConfigService, options?: RedisOptions) => {
    const logger = new Logger('Redis');
    const redisUrl = configService.get<string>('REDIS_URL');
    const client = redisUrl
      ? new Redis(redisUrl, options ?? {})
      : new Redis({ ...buildRedisOptions(configService), ...options });

    client.on('error', (error: NodeJS.ErrnoException) =>
      logger.error(error.message || error.code || String(error)),
    );

    return client;
  },
  inject: [ConfigService, { token: REDIS_CONFIG_OPTIONS, optional: true }],
};
