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
import { DeleteAccountInputDto } from '@application/User/dtos/deleteAccount.input.dto';
import { findUserByCurrentPassword } from '@application/User/utils/verifyCurrentPassword.util';
import { RevokeUserSessionsService } from '@application/Jwt/services/revokeUserSessions.service';

@Injectable()
export class DeleteAccountUseCase {
  private readonly logger = new Logger(DeleteAccountUseCase.name);

  constructor(
    @Inject(USER_DB_REPOSITORY)
    private readonly userDbRepository: IUserDbRepository,
    @Inject(USER_PROFILE_CACHE_REPOSITORY)
    private readonly userProfileCacheRepository: IUserProfileCacheRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    private readonly revokeUserSessionsService: RevokeUserSessionsService,
  ) {}

  async execute(userId: string, dto: DeleteAccountInputDto): Promise<void> {
    const user = await findUserByCurrentPassword(
      this.userDbRepository,
      this.passwordHasher,
      userId,
      dto.currentPassword,
    );

    // Сессии отзываются до удаления: версии токенов нужна строка пользователя.
    // Если удаление ниже упадёт, пользователь просто войдёт заново.
    await this.revokeUserSessionsService.revokeAll(user);

    const removedFollows = await this.userDbRepository.deleteAccount(user.id);

    this.logger.log(
      `Account ${userId} deleted, ${removedFollows} follow(s) removed`,
    );

    // Счётчики других пользователей поправит consumer по событиям unfollow
    // и сам сбросит их кеш; здесь — только профиль удалённого
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
