import { Inject, Injectable, Logger } from '@nestjs/common';
import { UserNotFoundError } from '@domain/User/errors/user.errors';
import { UserProfile } from '@domain/User/types/userProfile.type';
import { UsernameVO } from '@domain/User/value-objects/username.vo';
import { toUserProfile } from '@application/User/utils/userProfile.util';
import {
  IUserDbRepository,
  USER_DB_REPOSITORY,
} from '@domain/User/repositories/user.db.repository.inter';
import {
  IUserProfileCacheRepository,
  USER_PROFILE_CACHE_REPOSITORY,
} from '@domain/User/repositories/userProfile.cache.repository.inter';

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

@Injectable()
export class GetUserProfileUseCase {
  private readonly logger = new Logger(GetUserProfileUseCase.name);

  constructor(
    @Inject(USER_DB_REPOSITORY)
    private readonly userDbRepository: IUserDbRepository,
    @Inject(USER_PROFILE_CACHE_REPOSITORY)
    private readonly userProfileCacheRepository: IUserProfileCacheRepository,
  ) {}

  // Cache-aside: сбой Redis не ломает чтение — логируем и идём в БД.
  async execute(username: string): Promise<UserProfile> {
    const usernameVO = new UsernameVO(username);

    try {
      const cached =
        await this.userProfileCacheRepository.getByUsername(usernameVO);
      if (cached) return cached;
    } catch (error: unknown) {
      this.logger.warn(`Profile cache read failed: ${errorMessage(error)}`);
    }

    const user = await this.userDbRepository.findByUsername(usernameVO);

    // Деактивированный аккаунт не отличается от несуществующего и в кэш
    // не попадает. Деактивация должна вызывать invalidate — иначе ранее
    // закэшированный профиль доживёт до TTL.
    if (!user || !user.isActive) {
      throw new UserNotFoundError();
    }

    const profile = toUserProfile(user);

    try {
      await this.userProfileCacheRepository.set(profile);
    } catch (error: unknown) {
      this.logger.warn(`Profile cache write failed: ${errorMessage(error)}`);
    }

    return profile;
  }
}
