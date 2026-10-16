import { Inject, Injectable } from '@nestjs/common';
import { InvalidCredentialsError } from '@domain/User/errors/user.errors';
import { LoginInputDto } from '@application/Auth/dtos/login.input.dto';
import { IUserLoginResult } from '@domain/Jwt/types/userLoginResult.type';
import { UsernameVO } from '@domain/User/value-objects/username.vo';
import {
  IUserDbRepository,
  USER_DB_REPOSITORY,
} from '@domain/User/repositories/user.db.repository.inter';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '@domain/User/services/passwordHasher.inter';
import { TokenIssuerService } from '@application/Jwt/services/tokenIssuer.service';
import { UserTokenVersionService } from '@application/Jwt/services/userTokenVersion.service';

const DUMMY_PASSWORD = 'fakegram-dummy-password';

@Injectable()
export class LoginUseCase {
  // Хеш-заглушка для несуществующих пользователей: время ответа не должно
  // выдавать, зарегистрирован ли username
  private dummyPasswordHash?: Promise<string>;

  constructor(
    @Inject(USER_DB_REPOSITORY)
    private readonly userDbRepository: IUserDbRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenIssuer: TokenIssuerService,
    private readonly userTokenVersionService: UserTokenVersionService,
  ) {}

  async execute(dto: LoginInputDto): Promise<IUserLoginResult> {
    const user = await this.userDbRepository.findByUsername(
      new UsernameVO(dto.username),
    );

    // Время ответа для несуществующего пользователя то же, что для существующего
    if (!user) {
      this.dummyPasswordHash ??= this.passwordHasher.hash(DUMMY_PASSWORD);
      await this.passwordHasher.verify(
        dto.password,
        await this.dummyPasswordHash,
      );
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await this.passwordHasher.verify(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // Вход с верным паролем восстанавливает деактивированный аккаунт
    if (!user.isActive) {
      user.activate();
      await this.userDbRepository.updateActive(user.id, true);
    }

    const previousHash = user.passwordHash;

    // Миграция legacy HMAC-хешей и устаревших параметров argon2 при входе
    if (this.passwordHasher.needsRehash(previousHash)) {
      user.changePasswordHash(await this.passwordHasher.hash(dto.password));
    }

    user.updateLastLogin();

    // Пишем только lastLoginAt (и перехеш, если пароль не сменили параллельно)
    const savedUser = await this.userDbRepository.recordLogin(user.id, {
      lastLoginAt: user.lastLoginAt ?? new Date(),
      passwordRehash:
        user.passwordHash !== previousHash
          ? { previousHash, newHash: user.passwordHash }
          : undefined,
    });

    // Аккаунт могли деактивировать между чтением и записью
    const tokenVersion = await this.userTokenVersionService.getCurrent(
      savedUser.id,
    );

    if (tokenVersion === null) {
      throw new InvalidCredentialsError();
    }

    const jwt = await this.tokenIssuer.issue(savedUser, tokenVersion);

    return { jwt, user: savedUser };
  }
}
