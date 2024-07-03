import { RefreshTokenDto } from '../../../application/dtos/Jwt/refreshToken.dto';
import { IRefreshJwtToken } from '../entities/refreshJwtToken.entity';

export interface IRefreshJwtTokenRepository {
  getRefreshToken(refreshToken: string): Promise<IRefreshJwtToken | null>;

  saveRefreshToken(dto: RefreshTokenDto): Promise<IRefreshJwtToken>;

  updateRefreshToken(dto: RefreshTokenDto): Promise<IRefreshJwtToken | null>;

  deleteRefreshToken(refreshToken: string): Promise<IRefreshJwtToken | null>;
}
