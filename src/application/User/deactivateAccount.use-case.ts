import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IUserDbRepository,
  USER_DB_REPOSITORY,
} from '@domain/User/repositories/user.db.repository.inter';
import {
  IUserProfileCacheRepository,
  USER_PROFILE_CACHE_REPOSITORY,
} from '@domain/User/repositories/userProfile.cache.repository.inter';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '@domain/User/services/passwordHasher.inter';
import { DeactivateAccountInputDto } from '@application/User/dtos/deactivateAccount.input.dto';
import { findUserByCurrentPassword } from '@application/User/utils/verifyCurrentPassword.util';
import { RevokeUserSessionsService } from '@application/Jwt/services/revokeUserSessions.service';

@Injectable()
export class DeactivateAccountUseCase {
  private readonly logger = new Logger(DeactivateAccountUseCase.name);

  constructor(
    @Inject(USER_DB_REPOSITORY)
    private readonly userDbRepository: IUserDbRepository,
    @Inject(USER_PROFILE_CACHE_REPOSITORY)
    private readonly userProfileCacheRepository: IUserProfileCacheRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    private readonly revokeUserSessionsService: RevokeUserSessionsService,
  ) {}

  async execute(userId: string, dto: DeactivateAccountInputDto): Promise<void> {
    const user = await findUserByCurrentPassword(
      this.userDbRepository,
      this.passwordHasher,
      userId,
      dto.currentPassword,
    );

    user.deactivate();
    await this.userDbRepository.updateActive(user.id, user.isActive);

    // Кешированная версия токена не перепроверяет isActive: без отзыва
    // выданные access-токены жили бы до истечения срока
    await this.revokeUserSessionsService.revokeAll(user);

    // Подписки и счётчики не трогаем: аккаунт скрыт из профилей и списков,
    // после восстановления всё на месте
    try {
      await this.userProfileCacheRepository.invalidate([user.id]);
    } catch (error: unknown) {
      this.logger.error(
        `Profile cache invalidation failed, stale until TTL for user: ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
