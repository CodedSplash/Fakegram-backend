import { GenerateJwtTokenDto } from '../../../application/dtos/Jwt/generateJwtToken.dto';
import { RefreshTokenDto } from '../../../application/dtos/Jwt/refreshToken.dto';
import { IJwtTokenPayload } from '../types/jwtTokenPayload.interface';
import { IJwtTokens } from '../types/jwtTokens.interface';
import { IRefreshJwtToken } from '../entities/refreshJwtToken.entity';

export interface IJwtTokenService {
  getRefreshToken(refreshToken: string): Promise<IRefreshJwtToken>;

  saveRefreshToken(dto: RefreshTokenDto): Promise<IRefreshJwtToken>;

  generateTokens(dto: GenerateJwtTokenDto): Promise<IJwtTokens>;

  refreshToken(refreshToken: string): Promise<IJwtTokens>;

  deleteRefreshToken(refreshToken: string): Promise<IRefreshJwtToken>;

  validateRefreshToken(refreshToken: string): IJwtTokenPayload;

  validateAccessToken(accessToken: string): IJwtTokenPayload;
}
