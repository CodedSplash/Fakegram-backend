import { sign } from 'jsonwebtoken';
import { HmacSHA256 } from 'crypto-js';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IUserAuthRepository } from '@core/Auth/repositories/userAuth.repository.interface';
import { UserAuthRepository } from '@infrastructure/repositories/Auth/userAuth.repository';
import { RefreshTokenDto } from '@application/dtos/Jwt/refreshToken.dto';
import { IUserProfileRepository } from '@core/UserProfile/repositories/userProfile.repository.interface';
import { UserProfileRepository } from '@infrastructure/repositories/UserProfile/userProfile.repository';
import { UserRegistrationDto } from '@application/dtos/Auth/userRegistration.dto';
import { RefreshJwtTokenRepository } from '@infrastructure/repositories/Jwt/refreshJwtToken.repository';
import { IRefreshJwtTokenRepository } from '@core/Jwt/repositories/refreshJwtToken.repository.interface';
import { IUserRegistrationResult } from '@core/Auth/types/userRegistrationResult.interface';

@Injectable()
export class RegistrationUseCase {
  constructor(
    @Inject(UserAuthRepository)
    private readonly userAuthRepository: IUserAuthRepository,
    @Inject(UserProfileRepository)
    private readonly userProfileRepository: IUserProfileRepository,
    @Inject(RefreshJwtTokenRepository)
    private readonly refreshJwtTokenRepository: IRefreshJwtTokenRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: UserRegistrationDto): Promise<IUserRegistrationResult> {
    const hasUser = await this.userProfileRepository.getByUsername(
      dto.username,
    );

    if (hasUser) {
      throw new BadRequestException('Пользователь уже зарегистрирован.');
    }

    const hashPassword = HmacSHA256(
      dto.password,
      this.configService.get('SECRET_PASSWORD_KEY'),
    ).toString();

    const userRegistrationData = {
      ...dto,
      password: hashPassword,
    };

    const newUser =
      await this.userAuthRepository.createUser(userRegistrationData);

    const accessToken = sign(
      {
        id: newUser.id,
        username: newUser.username,
        roles: newUser.roles,
      },
      this.configService.get('SECRET_ACCESS_JWT_KEY'),
      {
        algorithm: 'HS256',
        expiresIn: '30m',
      },
    );

    const refreshToken = sign(
      {
        id: newUser.id,
        username: newUser.username,
        roles: newUser.roles,
      },
      this.configService.get('SECRET_REFRESH_JWT_KEY'),
      {
        algorithm: 'HS256',
        expiresIn: '30d',
      },
    );

    const refreshTokenDto = new RefreshTokenDto({
      ...newUser,
      refreshToken,
    });

    await this.refreshJwtTokenRepository.saveRefreshToken(refreshTokenDto);

    return {
      jwt: {
        accessToken,
        refreshToken,
      },
      user: newUser,
    };
  }
}
