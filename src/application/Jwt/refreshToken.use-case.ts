import { verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { IJwtTokens } from '@domain/Jwt/types/jwtTokens.interface';
import {
  IRefreshTokenDbRepository,
  REFRESH_TOKEN_DB_REPOSITORY,
} from '@domain/Jwt/repositories/refreshToken.db.repository.inter';
import {
  IRefreshTokenHasher,
  REFRESH_TOKEN_HASHER,
} from '@domain/Jwt/services/refreshTokenHasher.inter';
import { IJwtTokenPayload } from '@domain/Jwt/types/jwtTokenPayload.interface';
import {
  IUserDbRepository,
  USER_DB_REPOSITORY,
} from '@domain/User/repositories/user.db.repository.inter';
import { UsernameVO } from '@domain/User/value-objects/username.vo';
import { RefreshTokenHashVO } from '@domain/Jwt/value-objects/refreshTokenHash.vo';
import {
  AuthorizationError,
  RefreshTokenMissingError,
} from '@domain/Jwt/errors/jwt.errors';
import { INITIAL_TOKEN_VERSION } from '@domain/User/types/userSessionState.type';
import { TokenIssuerService } from '@application/Jwt/services/tokenIssuer.service';
import { UserTokenVersionService } from '@application/Jwt/services/userTokenVersion.service';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_DB_REPOSITORY)
    private readonly refreshTokenDbRepository: IRefreshTokenDbRepository,
    @Inject(REFRESH_TOKEN_HASHER)
    private readonly refreshTokenHasher: IRefreshTokenHasher,
    @Inject(USER_DB_REPOSITORY)
    private readonly userDbRepository: IUserDbRepository,
    private readonly tokenIssuer: TokenIssuerService,
    private readonly userTokenVersionService: UserTokenVersionService,
    private readonly configService: ConfigService,
  ) {}

  async execute(token: string): Promise<IJwtTokens> {
    if (!token) {
      throw new RefreshTokenMissingError();
    }

    let validateRefreshToken: IJwtTokenPayload;

    try {
      validateRefreshToken = verify(
        token,
        this.configService.get('SECRET_REFRESH_JWT_KEY'),
        { algorithms: ['HS256'] },
      ) as IJwtTokenPayload;
    } catch {
      throw new AuthorizationError();
    }

    if (!validateRefreshToken?.username) {
      throw new AuthorizationError();
    }

    let username: UsernameVO;

    try {
      username = new UsernameVO(validateRefreshToken.username);
    } catch {
      throw new AuthorizationError();
    }

    const storedToken =
      await this.refreshTokenDbRepository.findByUsername(username);

    // Сессия отозвана (logout) или ещё не создана
    if (!storedToken) {
      throw new AuthorizationError();
    }

    // Подпись валидна, но токен не совпадает с текущим: это повторное
    // использование старого (возможно украденного) токена — отзываем сессию
    if (
      !this.refreshTokenHasher.compare(token, storedToken.tokenHash.toString())
    ) {
      await this.refreshTokenDbRepository.deleteByUsername(username);
      throw new AuthorizationError();
    }

    const findUser = await this.userDbRepository.findByUsername(username);

    if (!findUser || !findUser.isActive) {
      await this.refreshTokenDbRepository.deleteByUsername(username);
      throw new AuthorizationError();
    }

    // Refresh токен несёт версию на момент выдачи: после отзыва (смена
    // пароля/username, logout) он недействителен, даже если строка сессии
    // осталась. Токены без tv (до появления версии) — версия 0
    const currentVersion = await this.userTokenVersionService.getCurrent(
      findUser.id,
    );

    if (
      currentVersion === null ||
      currentVersion !== (validateRefreshToken.tv ?? INITIAL_TOKEN_VERSION)
    ) {
      await this.refreshTokenDbRepository.deleteByUsername(username);
      throw new AuthorizationError();
    }

    const { accessToken, refreshToken } = this.tokenIssuer.sign(
      findUser,
      currentVersion,
    );

    // Атомарная ротация: из двух конкурентных запросов с одним токеном
    // успешен только один
    const isRotated = await this.refreshTokenDbRepository.rotate(
      username,
      storedToken.tokenHash,
      new RefreshTokenHashVO(this.refreshTokenHasher.hash(refreshToken)),
    );

    if (!isRotated) {
      throw new AuthorizationError();
    }

    return { accessToken, refreshToken };
  }
}
