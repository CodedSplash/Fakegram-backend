import { Inject, Injectable } from '@nestjs/common';
import { IJwtTokens } from '@domain/Jwt/types/jwtTokens.interface';
import { SamePasswordError } from '@domain/User/errors/user.errors';
import {
  IUserDbRepository,
  USER_DB_REPOSITORY,
} from '@domain/User/repositories/user.db.repository.inter';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '@domain/User/services/passwordHasher.inter';
import { ChangePasswordInputDto } from '@application/User/dtos/changePassword.input.dto';
import { findUserByCurrentPassword } from '@application/User/utils/verifyCurrentPassword.util';
import { TokenIssuerService } from '@application/Jwt/services/tokenIssuer.service';
import { RevokeUserSessionsService } from '@application/Jwt/services/revokeUserSessions.service';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(USER_DB_REPOSITORY)
    private readonly userDbRepository: IUserDbRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenIssuer: TokenIssuerService,
    private readonly revokeUserSessionsService: RevokeUserSessionsService,
  ) {}

  async execute(
    userId: string,
    dto: ChangePasswordInputDto,
  ): Promise<IJwtTokens> {
    if (dto.newPassword === dto.currentPassword) {
      throw new SamePasswordError();
    }

    const user = await findUserByCurrentPassword(
      this.userDbRepository,
      this.passwordHasher,
      userId,
      dto.currentPassword,
    );

    user.changePasswordHash(await this.passwordHasher.hash(dto.newPassword));

    const savedUser = await this.userDbRepository.updatePasswordHash(
      user.id,
      user.passwordHash,
    );

    // Отзыв всех выданных токенов (refresh сессия + версия токенов);
    // этот клиент получает новую пару с новой версией
    const tokenVersion =
      await this.revokeUserSessionsService.revokeAll(savedUser);

    return this.tokenIssuer.issue(savedUser, tokenVersion);
  }
}
