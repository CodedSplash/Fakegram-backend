import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '@presentation/decorators/isPublic.decorator';
import { UserLoginDto } from '@presentation/dtos/Auth/userLogin.dto';
import { UserLoginResultDto } from '@presentation/dtos/Auth/userLoginResult.dto';
import { UserRegistrationDto } from '@presentation/dtos/Auth/userRegistration.dto';
import { UserResponseDto } from '@presentation/dtos/Auth/userResponse.dto';
import { userLoginExample } from '@presentation/swagger/examples/Auth/userLogin.example';
import { userLoginUnauthorizedExample } from '@presentation/swagger/examples/Auth/userLoginUnauthorized.example';
import { userRegistrationBadRequestExample } from '@presentation/swagger/examples/Auth/userRegistrationBadRequest.example';
import { userRegistrationCreateExample } from '@presentation/swagger/examples/Auth/userRegistrationCreate.example';
import { internalServerErrorExample } from '@presentation/swagger/examples/general/internalServerError.example';
import { throttlerExceptionExample } from '@presentation/swagger/examples/general/throttlerException.example';
import { DefaultErrorResponseType } from '@presentation/types/defaultErrorResponse.type';
import { DetailedInfoErrorResponseType } from '@presentation/types/DetailedInfoErrorResponse.type';
import { ValidationErrorResponseType } from '@presentation/types/validationErrorResponse.type';
import { RegistrationUseCase } from '@application/Auth/registration.use-case';
import { LoginUseCase } from '@application/Auth/login.use-case';

@Controller('auth')
@ApiTags('Auth')
@ApiExtraModels(ValidationErrorResponseType, DetailedInfoErrorResponseType)
export class UserAuthController {
  constructor(
    private readonly registrationUseCase: RegistrationUseCase,
    private readonly loginUseCase: LoginUseCase,
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

    res.cookie('refreshToken', jwt.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return {
      user: new UserResponseDto(user),
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

    res.cookie('refreshToken', jwt.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return {
      user: new UserResponseDto(user),
      jwt,
    };
  }
}
