import { Inject, Injectable, Logger } from '@nestjs/common';
import { IJwtTokens } from '@domain/Jwt/types/jwtTokens.interface';
import { UsernameVO } from '@domain/User/value-objects/username.vo';
import {
  SameUsernameError,
  UsernameAlreadyTakenError,
} from '@domain/User/errors/user.errors';
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
import { ChangeUsernameInputDto } from '@application/User/dtos/changeUsername.input.dto';
import { findUserByCurrentPassword } from '@application/User/utils/verifyCurrentPassword.util';
import { TokenIssuerService } from '@application/Jwt/services/tokenIssuer.service';
import { RevokeUserSessionsService } from '@application/Jwt/services/revokeUserSessions.service';

@Injectable()
export class ChangeUsernameUseCase {
  private readonly logger = new Logger(ChangeUsernameUseCase.name);

  constructor(
    @Inject(USER_DB_REPOSITORY)
    private readonly userDbRepository: IUserDbRepository,
    @Inject(USER_PROFILE_CACHE_REPOSITORY)
    private readonly userProfileCacheRepository: IUserProfileCacheRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenIssuer: TokenIssuerService,
    private readonly revokeUserSessionsService: RevokeUserSessionsService,
  ) {}

  async execute(
    userId: string,
    dto: ChangeUsernameInputDto,
  ): Promise<IJwtTokens> {
    const newUsername = new UsernameVO(dto.username);

    const user = await findUserByCurrentPassword(
      this.userDbRepository,
      this.passwordHasher,
      userId,
      dto.currentPassword,
    );

    const oldUsername = user.username;

    if (oldUsername.equals(newUsername)) {
      throw new SameUsernameError();
    }

    // Быстрая проверка ради понятной ошибки; гонку закрывает unique-индекс (updateUsername)
    if (await this.userDbRepository.existsByUsername(newUsername)) {
      throw new UsernameAlreadyTakenError();
    }

    user.changeUsername(newUsername.toString());

    const savedUser = await this.userDbRepository.updateUsername(
      user.id,
      user.username,
    );

    // Refresh сессия хранится по username: отзыв удаляет строку старого
    // username и инкрементирует версию токенов (старые токены со старым
    // username больше не проходят), затем выпускаем новую пару
    const tokenVersion = await this.revokeUserSessionsService.revokeAll({
      id: savedUser.id,
      username: oldUsername,
    });
    const tokens = await this.tokenIssuer.issue(savedUser, tokenVersion);

    // Ключ profile:username:<old> самовосстанавливается при чтении
    try {
      await this.userProfileCacheRepository.invalidate([savedUser.id]);
    } catch (error: unknown) {
      this.logger.error(
        `Profile cache invalidation failed, stale until TTL for user: ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    return tokens;
  }
}
