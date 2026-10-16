import Redis from 'ioredis';
import { Inject, Injectable } from '@nestjs/common';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { UsernameVO } from '@domain/User/value-objects/username.vo';
import { UserProfile } from '@domain/User/types/userProfile.type';
import { REDIS_SERVICE } from '@infrastructure/cache/redis/services/redis.service';
import { IUserProfileCacheRepository } from '@domain/User/repositories/userProfile.cache.repository.inter';

const PROFILE_TTL_SECONDS = 600;

// profile:<userId> — JSON профиля, его удаляет инвалидация по id.
// profile:username:<username> — userId; не инвалидируется, при смене
// username промах отсекается сверкой username в профиле.
const profileKey = (userId: string) => `profile:${userId}`;
const usernameKey = (username: string) => `profile:username:${username}`;

@Injectable()
export class UserProfileCacheRepository implements IUserProfileCacheRepository {
  constructor(@Inject(REDIS_SERVICE) private readonly redisService: Redis) {}

  async getByUsername(username: UsernameVO): Promise<UserProfile | null> {
    this.ensureReady();

    const userId = await this.redisService.get(
      usernameKey(username.toString()),
    );
    if (!userId) return null;

    const raw = await this.redisService.get(profileKey(userId));
    if (!raw) return null;

    const cached = JSON.parse(raw) as UserProfile & { createdAt: string };
    if (cached.username !== username.toString()) return null;

    return { ...cached, createdAt: new Date(cached.createdAt) };
  }

  async set(profile: UserProfile): Promise<void> {
    this.ensureReady();

    const results = await this.redisService
      .multi()
      .set(
        profileKey(profile.id),
        JSON.stringify(profile),
        'EX',
        PROFILE_TTL_SECONDS,
      )
      .set(usernameKey(profile.username), profile.id, 'EX', PROFILE_TTL_SECONDS)
      .exec();

    // Ошибки отдельных команд MULTI не бросаются, а приходят в результате.
    const failed = results?.find(([error]) => error);
    if (failed) throw failed[0];
  }

  async invalidate(userIds: UserIdVO[]): Promise<void> {
    if (userIds.length === 0) return;
    this.ensureReady();

    await this.redisService.del(
      ...userIds.map((id) => profileKey(id.toString())),
    );
  }

  // Без соединения команды копятся в offline-очереди и ждут переподключения —
  // кэш не должен тормозить чтение, поэтому сразу отдаём ошибку.
  private ensureReady(): void {
    if (this.redisService.status !== 'ready') {
      throw new Error(
        `Redis is not ready (status: ${this.redisService.status})`,
      );
    }
  }
}
