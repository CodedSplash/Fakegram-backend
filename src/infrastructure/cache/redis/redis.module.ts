import Redis, { RedisOptions } from 'ioredis';
import {
  DynamicModule,
  Inject,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import {
  REDIS_CONFIG_OPTIONS,
  REDIS_SERVICE,
  RedisFactory,
} from '@infrastructure/cache/redis/services/redis.service';

@Module({})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_SERVICE) private readonly redisService: Redis) {}

  static register(data?: {
    options?: RedisOptions;
    isGlobal?: boolean;
  }): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        RedisFactory,
        {
          provide: REDIS_CONFIG_OPTIONS,
          useValue: data?.options,
        },
      ],
      exports: [RedisFactory],
      global: data?.isGlobal || false,
    };
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.redisService.status !== 'end') {
      await this.redisService.quit();
    }
  }
}
