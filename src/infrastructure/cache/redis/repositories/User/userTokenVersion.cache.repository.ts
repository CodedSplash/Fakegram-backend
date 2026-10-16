import Redis from 'ioredis';
import { Inject, Injectable } from '@nestjs/common';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { REDIS_SERVICE } from '@infrastructure/cache/redis/services/redis.service';
import { IUserTokenVersionCacheRepository } from '@domain/User/repositories/userTokenVersion.cache.repository.inter';

// Совпадает со сроком жизни access токена
const TOKEN_VERSION_TTL_SECONDS = 30 * 60;

// user:tv:<userId> — текущая версия токенов пользователя
const tokenVersionKey = (userId: string) => `user:tv:${userId}`;

// Записывает версию, только если она больше закэшированной (версия монотонна).
// Иначе заполнение кэша старым значением из БД, завершившееся после отзыва,
// вернуло бы в кэш отозванную версию.
const SET_IF_NEWER_SCRIPT = `
local current = redis.call('GET', KEYS[1])
if current and tonumber(current) >= tonumber(ARGV[1]) then
  return 0
end
redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[2])
return 1
`;

@Injectable()
export class UserTokenVersionCacheRepository implements IUserTokenVersionCacheRepository {
  constructor(@Inject(REDIS_SERVICE) private readonly redisService: Redis) {}

  async get(userId: UserIdVO): Promise<number | null> {
    this.ensureReady();

    const raw = await this.redisService.get(tokenVersionKey(userId.toString()));
    if (raw === null) return null;

    const tokenVersion = Number(raw);
    return Number.isInteger(tokenVersion) ? tokenVersion : null;
  }

  async setIfNewer(userId: UserIdVO, tokenVersion: number): Promise<void> {
    this.ensureReady();

    await this.redisService.eval(
      SET_IF_NEWER_SCRIPT,
      1,
      tokenVersionKey(userId.toString()),
      tokenVersion,
      TOKEN_VERSION_TTL_SECONDS,
    );
  }

  async invalidate(userId: UserIdVO): Promise<void> {
    this.ensureReady();

    await this.redisService.del(tokenVersionKey(userId.toString()));
  }

  // Без соединения команды копятся в offline-очереди — сразу отдаём ошибку,
  // вызывающий код уходит в БД.
  private ensureReady(): void {
    if (this.redisService.status !== 'ready') {
      throw new Error(
        `Redis is not ready (status: ${this.redisService.status})`,
      );
    }
  }
}
