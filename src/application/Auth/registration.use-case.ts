import { createId } from '@paralleldrive/cuid2';
import { Inject, Injectable } from '@nestjs/common';
import { UserAlreadyExistsError } from '@domain/User/errors/user.errors';
import {
  IUserDbRepository,
  USER_DB_REPOSITORY,
} from '@domain/User/repositories/user.db.repository.inter';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '@domain/User/services/passwordHasher.inter';
import { RegistrationInputDto } from '@application/Auth/dtos/registration.input.dto';
import { IUserRegistrationResult } from '@domain/Jwt/types/userRegistrationResult.interface';
import { UsernameVO } from '@domain/User/value-objects/username.vo';
import { User } from '@domain/User/entities/user.entity';
import { INITIAL_TOKEN_VERSION } from '@domain/User/types/userSessionState.type';
import { TokenIssuerService } from '@application/Jwt/services/tokenIssuer.service';

@Injectable()
export class RegistrationUseCase {
  constructor(
    @Inject(USER_DB_REPOSITORY)
    private readonly userDbRepository: IUserDbRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenIssuer: TokenIssuerService,
  ) {}

  async execute(dto: RegistrationInputDto): Promise<IUserRegistrationResult> {
    const hasUser = await this.userDbRepository.existsByUsername(
      new UsernameVO(dto.username),
    );

    if (hasUser) {
      throw new UserAlreadyExistsError();
    }

    const user = new User({
      id: createId(),
      username: dto.username,
      email: dto.email,
      passwordHash: await this.passwordHasher.hash(dto.password),
      phoneNumber: dto.phoneNumber,
      dateOfBirth: new Date(dto.fullDateBirth),
    });

    // Регистрация сразу авторизует пользователя
    user.updateLastLogin();

    // Конфликт email/телефона (и гонка по username) приходит из create как 409
    const newUser = await this.userDbRepository.create(user);
    const jwt = await this.tokenIssuer.issue(newUser, INITIAL_TOKEN_VERSION);

    return { jwt, user: newUser };
  }
}
