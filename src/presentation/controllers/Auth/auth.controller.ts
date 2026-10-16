import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginUseCase } from '@application/Auth/login.use-case';
import { Public } from '@presentation/decorators/isPublic.decorator';
import { UserLoginDto } from '@presentation/dtos/User/userLogin.dto';
import { UserResponseDto } from '@presentation/dtos/User/userResponse.dto';
import { RegistrationUseCase } from '@application/Auth/registration.use-case';
import { UserLoginResultDto } from '@presentation/dtos/User/userLoginResult.dto';
import { UserRegistrationDto } from '@presentation/dtos/User/userRegistration.dto';
import { setRefreshTokenCookie } from '@presentation/utils/refreshTokenCookie.util';
import { userLoginExample } from '@presentation/swagger/examples/Auth/userLogin.example';
import { DefaultErrorResponseType } from '@presentation/types/defaultErrorResponse.type';
import { ValidationErrorResponseType } from '@presentation/types/validationErrorResponse.type';
import { DetailedInfoErrorResponseType } from '@presentation/types/DetailedInfoErrorResponse.type';
import { throttlerExceptionExample } from '@presentation/swagger/examples/general/throttlerException.example';
import { internalServerErrorExample } from '@presentation/swagger/examples/general/internalServerError.example';
import { userLoginUnauthorizedExample } from '@presentation/swagger/examples/Auth/userLoginUnauthorized.example';
import { userRegistrationCreateExample } from '@presentation/swagger/examples/Auth/userRegistrationCreate.example';
import {
  userRegistrationBadRequestExample,
  userRegistrationConflictExample,
} from '@presentation/swagger/examples/Auth/userRegistrationBadRequest.example';

@Controller('auth')
@ApiTags('Auth')
@ApiExtraModels(ValidationErrorResponseType, DetailedInfoErrorResponseType)
export class AuthController {
  constructor(
    private readonly registrationUseCase: RegistrationUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('registration')
  @ApiCreatedResponse({
    description: 'Пользователь был успешно зарегистрирован!',
    type: UserResponseDto,
    example: userRegistrationCreateExample,
  })
  @ApiBadRequestResponse({
    description: 'Ошибки связанные с плохим запросом',
    content: userRegistrationBadRequestExample,
  })
  @ApiConflictResponse({
    description: 'Пользователь уже зарегистрирован',
    type: DetailedInfoErrorResponseType,
    example: userRegistrationConflictExample,
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample('/auth/registration'),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample('/auth/registration/'),
  })
  async registration(
    @Body() dto: UserRegistrationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, jwt } = await this.registrationUseCase.execute(dto);

    setRefreshTokenCookie(res, jwt.refreshToken, this.configService);

    return {
      user: new UserResponseDto({
        id: user.id.toString(),
        username: user.username.toString(),
        email: user.email.toString(),
        phoneNumber: user.phoneNumber.toString(),
        dateOfBirth: new Date(user.dateOfBirth.value.getTime()),
        displayName: user.displayName,
        profilePhotoUrl: user.profilePhotoUrl,
        roles: user.roles,
        bio: user.bio,
        gender: user.gender,
        websiteUrl: user.websiteUrl,
        isVerified: user.isVerified,
        isPrivate: user.isPrivate,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        followersCount: user.followersCount,
        followingsCount: user.followingsCount,
        createdAt: user.createdAt,
      }),
      jwt,
    };
  }

  @Public()
  @Post('login')
  @ApiCreatedResponse({
    description: 'Пользователь был успешно авторизован!',
    type: UserLoginResultDto,
    example: userLoginExample,
  })
  @ApiUnauthorizedResponse({
    description: 'Были введены неверные данные!',
    type: DetailedInfoErrorResponseType,
    example: userLoginUnauthorizedExample,
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample('/auth/login'),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample('/auth/login/'),
  })
  async login(
    @Body() dto: UserLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, jwt } = await this.loginUseCase.execute(dto);

    setRefreshTokenCookie(res, jwt.refreshToken, this.configService);

    return {
      user: new UserResponseDto({
        id: user.id.toString(),
        username: user.username.toString(),
        email: user.email.toString(),
        phoneNumber: user.phoneNumber.toString(),
        dateOfBirth: new Date(user.dateOfBirth.value.getTime()),
        displayName: user.displayName,
        profilePhotoUrl: user.profilePhotoUrl,
        roles: user.roles,
        bio: user.bio,
        gender: user.gender,
        websiteUrl: user.websiteUrl,
        isVerified: user.isVerified,
        isPrivate: user.isPrivate,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        followersCount: user.followersCount,
        followingsCount: user.followingsCount,
        createdAt: user.createdAt,
      }),
      jwt,
    };
  }
}
