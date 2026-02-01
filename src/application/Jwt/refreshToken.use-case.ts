import { sign, verify } from 'jsonwebtoken';
import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IJwtTokens } from '@domain/Jwt/types/jwtTokens.interface';
import { RefreshTokenDto } from '@presentation/dtos/Jwt/refreshToken.dto';
import { ConfigService } from '@nestjs/config';
import { IRefreshJwtTokenRepository } from '@domain/Jwt/repositories/refreshJwtToken.repository.interface';
import { RefreshJwtTokenRepository } from '@infrastructure/repositories/Jwt/refreshJwtToken.repository';
import { IJwtTokenPayload } from '@domain/Jwt/types/jwtTokenPayload.interface';
import { IUserProfileRepository } from '@domain/UserProfile/repositories/userProfile.repository.interface';
import { UserProfileRepository } from '@infrastructure/repositories/UserProfile/userProfile.repository';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(RefreshJwtTokenRepository)
    private readonly refreshJwtTokenRepository: IRefreshJwtTokenRepository,
    @Inject(UserProfileRepository)
    private readonly userProfileRepository: IUserProfileRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(token: string): Promise<IJwtTokens> {
    if (!token) {
      throw new UnauthorizedException('Токен не обнаружен!');
    }

    const validateRefreshToken = verify(
      token,
      this.configService.get('SECRET_REFRESH_JWT_KEY'),
    ) as IJwtTokenPayload;

    const user = await this.userProfileRepository.getByUsername(
      validateRefreshToken.username,
    );

    if (!user) {
      throw new NotFoundException('Пользователь не найден!');
    }

    if (!validateRefreshToken || !user) {
      throw new UnauthorizedException('Ошибка авторизации!');
    }

    const accessToken = sign(
      {
        id: user.id,
        username: user.username,
        roles: user.roles,
      },
      this.configService.get('SECRET_ACCESS_JWT_KEY'),
      {
        algorithm: 'HS256',
        expiresIn: '30m',
      },
    );

    const refreshToken = sign(
      {
        id: user.id,
        username: user.username,
        roles: user.roles,
      },
      this.configService.get('SECRET_REFRESH_JWT_KEY'),
      {
        algorithm: 'HS256',
        expiresIn: '30d',
      },
    );

    const refreshTokenDto = new RefreshTokenDto({
      ...user,
      refreshToken,
    });

    await this.refreshJwtTokenRepository.updateRefreshToken(refreshTokenDto);

    return { accessToken, refreshToken };
  }
}
