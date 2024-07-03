import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HmacSHA256 } from 'crypto-js';
import { UserRegistrationDto } from 'src/application/dtos/Auth/userRegistration.dto';
import { GenerateJwtTokenDto } from '../../../application/dtos/Jwt/generateJwtToken.dto';
import { RefreshTokenDto } from '../../../application/dtos/Jwt/refreshToken.dto';
import { UserAuthRepository } from '../../../infrastructure/repositories/Auth/userAuth.repository';
import { JwtTokenService } from '../../Jwt/servicies/jwtToken.service';
import { IJwtTokenService } from '../../Jwt/servicies/jwtToken.service.interface';
import { UserProfileService } from '../../UserProfile/servicies/userProfile.service';
import { IUserProfileService } from '../../UserProfile/servicies/userProfile.service.interface';
import { IUserAuthRepository } from '../repositories/userAuth.repository.interface';
import { IUserRegistrationResult } from '../types/userRegistrationResult.interface';
import { IUserAuthService } from './userAuth.service.interface';

@Injectable()
export class UserAuthService implements IUserAuthService {
  constructor(
    @Inject(UserAuthRepository)
    private readonly userAuthRepository: IUserAuthRepository,
    @Inject(JwtTokenService)
    private readonly jwtTokenService: IJwtTokenService,
    @Inject(UserProfileService) readonly userService: IUserProfileService,
    private readonly configService: ConfigService,
  ) {}

  async registration(
    dto: UserRegistrationDto,
  ): Promise<IUserRegistrationResult> {
    const hasUser = await this.userService.getByUsername(dto.username);

    if (hasUser)
      throw new BadRequestException('Пользователь уже зарегестрирован');

    const hashPassword = HmacSHA256(
      dto.password,
      this.configService.get('SECRET_PASSWORD_KEY'),
    ).toString();

    const userRegistrationDto = new UserRegistrationDto({
      ...dto,
      password: hashPassword,
    });

    const newUser =
      await this.userAuthRepository.createUser(userRegistrationDto);

    const tokens = await this.jwtTokenService.generateTokens(
      new GenerateJwtTokenDto(newUser),
    );

    const refreshTokenDto = new RefreshTokenDto({
      ...newUser,
      refreshToken: tokens.refreshToken,
    });

    await this.jwtTokenService.saveRefreshToken(refreshTokenDto);

    return {
      jwt: tokens,
      user: newUser,
    };
  }
}
