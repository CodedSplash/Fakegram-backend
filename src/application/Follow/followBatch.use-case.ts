import { Inject, Injectable, Logger } from '@nestjs/common';
import { FollowEvent } from '@domain/Follow/events/follow.event.type';
import {
  IFollowDbRepository,
  FOLLOW_DB_REPOSITORY,
} from '@domain/Follow/repositories/follow.db.repository.inter';
import {
  IUserProfileCacheRepository,
  USER_PROFILE_CACHE_REPOSITORY,
} from '@domain/User/repositories/userProfile.cache.repository.inter';

@Injectable()
export class FollowBatchUseCase {
  private readonly logger = new Logger(FollowBatchUseCase.name);

  constructor(
    @Inject(FOLLOW_DB_REPOSITORY)
    private readonly followDbRepository: IFollowDbRepository,
    @Inject(USER_PROFILE_CACHE_REPOSITORY)
    private readonly userProfileCacheRepository: IUserProfileCacheRepository,
  ) {}

  async execute(events: FollowEvent[]) {
    const affectedUserIds = await this.followDbRepository.applyBatch(events);

    // Инвалидация строго после коммита. Ошибку не пробрасываем: пачка уже
    // применена, повтор лишь создаст шум. Устаревший профиль доживёт до TTL.
    try {
      await this.userProfileCacheRepository.invalidate(affectedUserIds);
    } catch (error: unknown) {
      this.logger.error(
        `Profile cache invalidation failed, stale until TTL for users: ${affectedUserIds
          .map((id) => id.toString())
          .join(', ')}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
