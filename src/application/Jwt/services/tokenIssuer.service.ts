import { sign } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { createId } from '@paralleldrive/cuid2';
import { Inject, Injectable } from '@nestjs/common';
import { User } from '@domain/User/entities/user.entity';
import { IJwtTokens } from '@domain/Jwt/types/jwtTokens.interface';
import { RefreshToken } from '@domain/Jwt/entities/refreshToken.entity';
import { IJwtTokenPayload } from '@domain/Jwt/types/jwtTokenPayload.interface';
import {
  IRefreshTokenDbRepository,
  REFRESH_TOKEN_DB_REPOSITORY,
} from '@domain/Jwt/repositories/refreshToken.db.repository.inter';
import {
  IRefreshTokenHasher,
  REFRESH_TOKEN_HASHER,
} from '@domain/Jwt/services/refreshTokenHasher.inter';

const ACCESS_TOKEN_EXPIRES_IN = '30m';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

@Injectable()
export class TokenIssuerService {
  constructor(
    @Inject(REFRESH_TOKEN_DB_REPOSITORY)
    private readonly refreshTokenDbRepository: IRefreshTokenDbRepository,
    @Inject(REFRESH_TOKEN_HASHER)
    private readonly refreshTokenHasher: IRefreshTokenHasher,
    private readonly configService: ConfigService,
  ) {}

  // Только подписывает пару токенов, сессию в БД не трогает.
  // tokenVersion — текущая версия токенов пользователя (claim tv)
  sign(user: User, tokenVersion: number): IJwtTokens {
    const payload: IJwtTokenPayload = {
      id: user.id.toString(),
      username: user.username.toString(),
      roles: user.roles,
      tv: tokenVersion,
    };

    const accessToken = sign(
      payload,
      this.configService.get('SECRET_ACCESS_JWT_KEY'),
      {
        algorithm: 'HS256',
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      },
    );

    // jwtid делает каждый refresh токен уникальным даже в пределах одной секунды
    const refreshToken = sign(
      payload,
      this.configService.get('SECRET_REFRESH_JWT_KEY'),
      {
        algorithm: 'HS256',
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        jwtid: createId(),
      },
    );

    return { accessToken, refreshToken };
  }

  // Подписывает пару и создаёт/заменяет сессию пользователя
  async issue(user: User, tokenVersion: number): Promise<IJwtTokens> {
    const tokens = this.sign(user, tokenVersion);

    // В БД сохраняется только хеш; upsert заменяет предыдущую сессию,
    // поэтому старый refresh токен (на других устройствах) перестаёт работать
    await this.refreshTokenDbRepository.upsert(
      new RefreshToken({
        id: createId(),
        username: user.username.toString(),
        tokenHash: this.refreshTokenHasher.hash(tokens.refreshToken),
      }),
    );

    return tokens;
  }
}
