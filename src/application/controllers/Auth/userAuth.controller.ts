import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { userRegistrationBadRequestExample } from '../../../common/swagger/examples/Auth/userRegistrationBadRequest.example';
import { userRegistrationCreateExample } from '../../../common/swagger/examples/Auth/userRegistrationCreate.example';
import { internalServerErrorExample } from '../../../common/swagger/examples/general/internalServerError.example';
import { DefaultErrorResponseType } from '../../../common/types/defaultErrorResponse.type';
import { ValidationErrorResponseType } from '../../../common/types/validationErrorResponse.type';
import { UserAuthService } from '../../../core/Auth/servicies/userAuth.service';
import { IUserAuthService } from '../../../core/Auth/servicies/userAuth.service.interface';
import { UserRegistrationDto } from '../../dtos/Auth/userRegistration.dto';
import { UserResponseDto } from '../../dtos/Auth/userResponse.dto';

@Controller('auth')
@ApiTags('Registration')
@ApiExtraModels(ValidationErrorResponseType, DefaultErrorResponseType)
export class UserAuthController {
  constructor(
    @Inject(UserAuthService) private readonly userAuthService: IUserAuthService,
  ) {}

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
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DefaultErrorResponseType,
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

    return new UserResponseDto(user);
  }
}
