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
import { Public } from '@application/decorators/isPublic.decorator';
import { UserLoginDto } from '@application/dtos/Auth/userLogin.dto';
import { UserLoginResultDto } from '@application/dtos/Auth/userLoginResult.dto';
import { UserRegistrationDto } from '@application/dtos/Auth/userRegistration.dto';
import { UserResponseDto } from '@application/dtos/Auth/userResponse.dto';
import { userLoginExample } from '@application/swagger/examples/Auth/userLogin.example';
import { userLoginUnauthorizedExample } from '@application/swagger/examples/Auth/userLoginUnauthorized.example';
import { userRegistrationBadRequestExample } from '@application/swagger/examples/Auth/userRegistrationBadRequest.example';
import { userRegistrationCreateExample } from '@application/swagger/examples/Auth/userRegistrationCreate.example';
import { internalServerErrorExample } from '@application/swagger/examples/general/internalServerError.example';
import { throttlerExceptionExample } from '@application/swagger/examples/general/throttlerException.example';
import { DefaultErrorResponseType } from '@application/types/defaultErrorResponse.type';
import { DetailedInfoErrorResponseType } from '@application/types/DetailedInfoErrorResponse.type';
import { ValidationErrorResponseType } from '@application/types/validationErrorResponse.type';
import { RegistrationUseCase } from '@src/use-cases/Auth/registration.use-case';
import { LoginUseCase } from '@src/use-cases/Auth/login.use-case';

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
