import { sign } from 'jsonwebtoken';
import { HmacSHA256 } from 'crypto-js';
import { ConfigService } from '@nestjs/config';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserLoginDto } from '@application/dtos/Auth/userLogin.dto';
import { IUserAuthRepository } from '@core/Auth/repositories/userAuth.repository.interface';
import { IUserLoginResult } from '@core/Auth/types/userLoginResult.type';
import { UserAuthRepository } from '@infrastructure/repositories/Auth/userAuth.repository';
import { IRefreshJwtTokenRepository } from '@core/Jwt/repositories/refreshJwtToken.repository.interface';
import { RefreshJwtTokenRepository } from '@infrastructure/repositories/Jwt/refreshJwtToken.repository';
import { RefreshTokenDto } from '@application/dtos/Jwt/refreshToken.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(UserAuthRepository)
    private readonly userAuthRepository: IUserAuthRepository,
    @Inject(RefreshJwtTokenRepository)
    private readonly refreshJwtTokenRepository: IRefreshJwtTokenRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: UserLoginDto): Promise<IUserLoginResult> {
    const user = await this.userAuthRepository.getUser(dto.username);

    if (!user) {
      throw new UnauthorizedException('Вы ввели неверные данные!');
    }

    const hashPassword = HmacSHA256(
      dto.password,
      this.configService.get('SECRET_PASSWORD_KEY'),
    ).toString();

    if (hashPassword !== user.password) {
      throw new UnauthorizedException('Вы ввели неверные данные!');
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

    await this.refreshJwtTokenRepository.deleteByUsername(user.username);

    await this.refreshJwtTokenRepository.saveRefreshToken(
      new RefreshTokenDto({
        username: user.username,
        refreshToken,
      }),
    );

    return {
      jwt: {
        accessToken,
        refreshToken,
      },
      user,
    };
  }
}
