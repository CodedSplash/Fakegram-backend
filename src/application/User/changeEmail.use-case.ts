import { Inject, Injectable, Logger } from '@nestjs/common';
import { EmailVO } from '@domain/User/value-objects/email.vo';
import {
  EmailAlreadyTakenError,
  SameEmailError,
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
import { ChangeEmailInputDto } from '@application/User/dtos/changeEmail.input.dto';
import { ChangeEmailOutputDto } from '@application/User/dtos/changeEmail.output.dto';
import { findUserByCurrentPassword } from '@application/User/utils/verifyCurrentPassword.util';

@Injectable()
export class ChangeEmailUseCase {
  private readonly logger = new Logger(ChangeEmailUseCase.name);

  constructor(
    @Inject(USER_DB_REPOSITORY)
    private readonly userDbRepository: IUserDbRepository,
    @Inject(USER_PROFILE_CACHE_REPOSITORY)
    private readonly userProfileCacheRepository: IUserProfileCacheRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(
    userId: string,
    dto: ChangeEmailInputDto,
  ): Promise<ChangeEmailOutputDto> {
    const newEmail = new EmailVO(dto.email);

    const user = await findUserByCurrentPassword(
      this.userDbRepository,
      this.passwordHasher,
      userId,
      dto.currentPassword,
    );

    if (user.email.equals(newEmail)) {
      throw new SameEmailError();
    }

    // Быстрая проверка ради понятной ошибки; гонку закрывает unique-индекс (updateEmail)
    if (await this.userDbRepository.existsByEmail(newEmail)) {
      throw new EmailAlreadyTakenError();
    }

    // Новый email требует повторного подтверждения (emailVerified = false)
    user.changeEmail(newEmail.toString());

    const savedUser = await this.userDbRepository.updateEmail(
      user.id,
      user.email,
    );

    try {
      await this.userProfileCacheRepository.invalidate([savedUser.id]);
    } catch (error: unknown) {
      this.logger.error(
        `Profile cache invalidation failed, stale until TTL for user: ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    return {
      email: savedUser.email.toString(),
      emailVerified: savedUser.emailVerified,
    };
  }
}
