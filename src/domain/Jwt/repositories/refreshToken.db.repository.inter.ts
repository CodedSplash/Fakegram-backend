import { RefreshToken } from '@domain/Jwt/entities/refreshToken.entity';
import { UsernameVO } from '@domain/User/value-objects/username.vo';
import { RefreshTokenHashVO } from '@domain/Jwt/value-objects/refreshTokenHash.vo';

export const REFRESH_TOKEN_DB_REPOSITORY = Symbol(
  'REFRESH_TOKEN_DB_REPOSITORY',
);

export interface IRefreshTokenDbRepository {
  findByUsername(username: UsernameVO): Promise<RefreshToken | null>;
  // Создаёт или заменяет токен пользователя (одна активная сессия)
  upsert(token: RefreshToken): Promise<void>;
  // Атомарная ротация: true, если текущий хеш совпал и был заменён
  rotate(
    username: UsernameVO,
    currentTokenHash: RefreshTokenHashVO,
    newTokenHash: RefreshTokenHashVO,
  ): Promise<boolean>;
  deleteByUsername(username: UsernameVO): Promise<void>;
}
