import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HmacSHA256 } from 'crypto-js';
import { UserLoginDto } from 'src/application/dtos/Auth/userLogin.dto';
import { UserRegistrationDto } from 'src/application/dtos/Auth/userRegistration.dto';
import { GenerateJwtTokenDto } from '../../../application/dtos/Jwt/generateJwtToken.dto';
import { RefreshTokenDto } from '../../../application/dtos/Jwt/refreshToken.dto';
import { UserAuthRepository } from '../../../infrastructure/repositories/Auth/userAuth.repository';
import { JwtTokenService } from '../../Jwt/servicies/jwtToken.service';
import { IJwtTokenService } from '../../Jwt/servicies/jwtToken.service.interface';
import { UserProfileService } from '../../UserProfile/servicies/userProfile.service';
import { IUserProfileService } from '../../UserProfile/servicies/userProfile.service.interface';
import { IUserAuthRepository } from '../repositories/userAuth.repository.interface';
import { IUserLoginResult } from '../types/userLoginResult.type';
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

  async login(dto: UserLoginDto): Promise<IUserLoginResult> {
    const user = await this.userAuthRepository.getUser(dto.username);

    if (!user) throw new UnauthorizedException('Вы ввели неверные данные!');

    const validationPassword = HmacSHA256(
      dto.password,
      this.configService.get('SECRET_PASSWORD_KEY'),
    ).toString();

    if (validationPassword !== user.password)
      throw new UnauthorizedException('Вы ввели неверные данные!');

    const jwtDto = new GenerateJwtTokenDto(user);
    const jwt = await this.jwtTokenService.generateTokens(jwtDto);

    await this.jwtTokenService.refreshToken(jwt.refreshToken);

    return {
      jwt,
      user,
    };
  }

  async registration(
    dto: UserRegistrationDto,
  ): Promise<IUserRegistrationResult> {
    const hasUser = await this.userService.getByUsername(dto.username);

    if (hasUser)
      throw new BadRequestException('Пользователь уже зарегистрирован');

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
