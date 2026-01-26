import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
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
import { Public } from 'src/application/decorators/isPublic.decorator';
import { UserAuthService } from '../../../core/Auth/servicies/userAuth.service';
import { IUserAuthService } from '../../../core/Auth/servicies/userAuth.service.interface';
import { UserLoginDto } from '../../dtos/Auth/userLogin.dto';
import { UserLoginResultDto } from '../../dtos/Auth/userLoginResult.dto';
import { UserRegistrationDto } from '../../dtos/Auth/userRegistration.dto';
import { UserResponseDto } from '../../dtos/Auth/userResponse.dto';
import { userLoginExample } from 'src/application/swagger/examples/Auth/userLogin.example';
import { userLoginUnauthorizedExample } from 'src/application/swagger/examples/Auth/userLoginUnauthorized.example';
import { userRegistrationBadRequestExample } from 'src/application/swagger/examples/Auth/userRegistrationBadRequest.example';
import { userRegistrationCreateExample } from 'src/application/swagger/examples/Auth/userRegistrationCreate.example';
import { internalServerErrorExample } from 'src/application/swagger/examples/general/internalServerError.example';
import { throttlerExceptionExample } from 'src/application/swagger/examples/general/throttlerException.example';
import { DefaultErrorResponseType } from 'src/application/types/defaultErrorResponse.type';
import { DetailedInfoErrorResponseType } from 'src/application/types/DetailedInfoErrorResponse.type';
import { ValidationErrorResponseType } from 'src/application/types/validationErrorResponse.type';

@Controller('auth')
@ApiTags('Auth')
@ApiExtraModels(ValidationErrorResponseType, DetailedInfoErrorResponseType)
export class UserAuthController {
  constructor(
    @Inject(UserAuthService) private readonly userAuthService: IUserAuthService,
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
    const { user, jwt } = await this.userAuthService.registration(dto);

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
    const { user, jwt } = await this.userAuthService.login(dto);

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
