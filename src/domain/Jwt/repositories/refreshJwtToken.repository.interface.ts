import { RefreshTokenDto } from '@presentation/dtos/Jwt/refreshToken.dto';
import { IRefreshJwtToken } from '@domain/Jwt/entities/refreshJwtToken.entity';

export interface IRefreshJwtTokenRepository {
  getRefreshToken(refreshToken: string): Promise<IRefreshJwtToken | null>;

  saveRefreshToken(dto: RefreshTokenDto): Promise<IRefreshJwtToken>;

  updateRefreshToken(dto: RefreshTokenDto): Promise<IRefreshJwtToken | null>;

  deleteByUsername(username: string): Promise<void>;

  deleteRefreshToken(refreshToken: string): Promise<IRefreshJwtToken | null>;
}
