import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign, verify } from 'jsonwebtoken';
import { IUserProfileService } from 'src/core/UserProfile/servicies/userProfile.service.interface';
import { GenerateJwtTokenDto } from '../../../application/dtos/Jwt/generateJwtToken.dto';
import { RefreshTokenDto } from '../../../application/dtos/Jwt/refreshToken.dto';
import { RefreshJwtTokenRepository } from '../../../infrastructure/repositories/Jwt/refreshJwtToken.repository';
import { UserProfileService } from '../../UserProfile/servicies/userProfile.service';
import { IRefreshJwtToken } from '../entities/refreshJwtToken.entity';
import { IRefreshJwtTokenRepository } from '../repositories/refreshJwtToken.repository.interface';
import { IJwtTokenPayload } from '../types/jwtTokenPayload.interface';
import { IJwtTokens } from '../types/jwtTokens.interface';
import { IJwtTokenService } from './jwtToken.service.interface';

@Injectable()
export class JwtTokenService implements IJwtTokenService {
  constructor(
    @Inject(RefreshJwtTokenRepository)
    private readonly refreshJwtTokenRepository: IRefreshJwtTokenRepository,
    @Inject(UserProfileService)
    private readonly userService: IUserProfileService,
    private readonly configService: ConfigService,
  ) {}

  async getRefreshToken(refreshToken: string): Promise<IRefreshJwtToken> {
    const refreshJwtToken =
      await this.refreshJwtTokenRepository.getRefreshToken(refreshToken);

    if (!refreshJwtToken) throw new NotFoundException('Токен не найден!');

    return refreshJwtToken;
  }

  async saveRefreshToken(dto: RefreshTokenDto): Promise<IRefreshJwtToken> {
    return await this.refreshJwtTokenRepository.saveRefreshToken(dto);
  }

  async generateTokens(dto: GenerateJwtTokenDto): Promise<IJwtTokens> {
    const accessToken = sign(
      {
        id: dto.id,
        username: dto.username,
        roles: dto.roles,
      },
      this.configService.get('SECRET_ACCESS_JWT_KEY'),
      {
        algorithm: 'HS256',
        expiresIn: '30m',
      },
    );

    const refreshToken = sign(
      {
        id: dto.id,
        username: dto.username,
        roles: dto.roles,
      },
      this.configService.get('SECRET_REFRESH_JWT_KEY'),
      {
        algorithm: 'HS256',
        expiresIn: '30d',
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<IJwtTokens> {
    if (!refreshToken) throw new UnauthorizedException('Токен не обнаружен!');

    const validateRefreshToken = this.validateRefreshToken(refreshToken);
    const user = await this.userService.hasUser(validateRefreshToken?.username);

    if (!validateRefreshToken || !user)
      throw new UnauthorizedException('Ошибка авторизации!');

    const tokens = await this.generateTokens(new GenerateJwtTokenDto(user));

    const refreshTokenDto = new RefreshTokenDto({
      ...user,
      refreshToken: tokens.refreshToken,
    });

    await this.refreshJwtTokenRepository.updateRefreshToken(refreshTokenDto);

    return tokens;
  }

  async deleteRefreshToken(refreshToken: string): Promise<IRefreshJwtToken> {
    const deleteRefreshToken =
      await this.refreshJwtTokenRepository.deleteRefreshToken(refreshToken);

    if (!deleteRefreshToken) throw new NotFoundException('Токен не найден!');

    return deleteRefreshToken;
  }

  validateRefreshToken(refreshToken: string): IJwtTokenPayload {
    return verify(
      refreshToken,
      this.configService.get('SECRET_REFRESH_JWT_KEY'),
    ) as IJwtTokenPayload;
  }

  validateAccessToken(accessToken: string): IJwtTokenPayload {
    return verify(
      accessToken,
      this.configService.get('SECRET_ACCESS_JWT_KEY'),
    ) as IJwtTokenPayload;
  }
}
