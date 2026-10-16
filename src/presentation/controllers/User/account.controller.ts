import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '@presentation/decorators/currentUser.decorator';
import { IJwtTokenPayload } from '@domain/Jwt/types/jwtTokenPayload.interface';
import { ChangePasswordUseCase } from '@application/User/changePassword.use-case';
import { ChangeUsernameUseCase } from '@application/User/changeUsername.use-case';
import { ChangeEmailUseCase } from '@application/User/changeEmail.use-case';
import { DeleteAccountUseCase } from '@application/User/deleteAccount.use-case';
import { DeactivateAccountUseCase } from '@application/User/deactivateAccount.use-case';
import { ConfirmPasswordDto } from '@presentation/dtos/User/confirmPassword.dto';
import { FOLLOW_WRITE_THROTTLE } from '@presentation/constants/throttle.constants';
import { ChangePasswordDto } from '@presentation/dtos/User/changePassword.dto';
import { ChangeUsernameDto } from '@presentation/dtos/User/changeUsername.dto';
import { ChangeEmailDto } from '@presentation/dtos/User/changeEmail.dto';
import { ChangeEmailResponseDto } from '@presentation/dtos/User/changeEmailResponse.dto';
import { RefreshTokenResponseDto } from '@presentation/dtos/Jwt/refreshTokenResponse.dto';
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from '@presentation/utils/refreshTokenCookie.util';
import { DefaultErrorResponseType } from '@presentation/types/defaultErrorResponse.type';
import { DetailedInfoErrorResponseType } from '@presentation/types/DetailedInfoErrorResponse.type';
import { ValidationErrorResponseType } from '@presentation/types/validationErrorResponse.type';
import { throttlerExceptionExample } from '@presentation/swagger/examples/general/throttlerException.example';
import { internalServerErrorExample } from '@presentation/swagger/examples/general/internalServerError.example';
import { refreshTokenResponseExample } from '@presentation/swagger/examples/Jwt/refreshTokenResponse.example';
import {
  changeEmailBadRequestExample,
  changeEmailConflictExample,
  changeEmailPathExample,
  changeEmailResponseExample,
  changeEmailUnauthorizedExample,
  changePasswordBadRequestExample,
  changePasswordPathExample,
  changePasswordUnauthorizedExample,
  changeUsernameBadRequestExample,
  changeUsernameConflictExample,
  changeUsernamePathExample,
  changeUsernameUnauthorizedExample,
  deactivateAccountBadRequestExample,
  deactivateAccountPathExample,
  deactivateAccountUnauthorizedExample,
  deleteAccountBadRequestExample,
  deleteAccountPathExample,
  deleteAccountUnauthorizedExample,
} from '@presentation/swagger/examples/User/account.example';

@Controller('user/me')
@ApiTags('User account')
@ApiBearerAuth()
@ApiExtraModels(ValidationErrorResponseType, DetailedInfoErrorResponseType)
export class AccountController {
  constructor(
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly changeUsernameUseCase: ChangeUsernameUseCase,
    private readonly changeEmailUseCase: ChangeEmailUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
    private readonly deactivateAccountUseCase: DeactivateAccountUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Put('password')
  @ApiOperation({
    summary: 'Смена пароля',
    description:
      'Требует текущий пароль. Завершает сессии на других устройствах и выдаёт новую пару токенов (refresh токен также в cookie).',
  })
  @ApiOkResponse({
    description: 'Пароль изменён, выданы новые токены.',
    type: RefreshTokenResponseDto,
    example: refreshTokenResponseExample,
  })
  @ApiBadRequestResponse({
    description: 'Ошибки связанные с плохим запросом',
    content: changePasswordBadRequestExample,
  })
  @ApiUnauthorizedResponse({
    description: 'Неверный текущий пароль или ошибка авторизации',
    content: changePasswordUnauthorizedExample,
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample(changePasswordPathExample),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample(changePasswordPathExample),
  })
  async changePassword(
    @CurrentUser() user: IJwtTokenPayload,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshTokenResponseDto> {
    const tokens = await this.changePasswordUseCase.execute(user.id, dto);

    setRefreshTokenCookie(res, tokens.refreshToken, this.configService);

    return new RefreshTokenResponseDto(tokens);
  }

  @Patch('username')
  @ApiOperation({
    summary: 'Смена username',
    description:
      'Требует текущий пароль. Токены содержат username, поэтому выдаётся новая пара (refresh токен также в cookie), прежняя сессия завершается.',
  })
  @ApiOkResponse({
    description: 'Username изменён, выданы новые токены.',
    type: RefreshTokenResponseDto,
    example: refreshTokenResponseExample,
  })
  @ApiBadRequestResponse({
    description: 'Ошибки связанные с плохим запросом',
    content: changeUsernameBadRequestExample,
  })
  @ApiUnauthorizedResponse({
    description: 'Неверный текущий пароль или ошибка авторизации',
    content: changeUsernameUnauthorizedExample,
  })
  @ApiConflictResponse({
    description: 'Username уже занят',
    type: DetailedInfoErrorResponseType,
    example: changeUsernameConflictExample,
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample(changeUsernamePathExample),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample(changeUsernamePathExample),
  })
  async changeUsername(
    @CurrentUser() user: IJwtTokenPayload,
    @Body() dto: ChangeUsernameDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshTokenResponseDto> {
    const tokens = await this.changeUsernameUseCase.execute(user.id, dto);

    setRefreshTokenCookie(res, tokens.refreshToken, this.configService);

    return new RefreshTokenResponseDto(tokens);
  }

  @Patch('email')
  @ApiOperation({
    summary: 'Смена email',
    description:
      'Требует текущий пароль. Новый email требует повторного подтверждения (emailVerified = false).',
  })
  @ApiOkResponse({
    description: 'Email изменён.',
    type: ChangeEmailResponseDto,
    example: changeEmailResponseExample,
  })
  @ApiBadRequestResponse({
    description: 'Ошибки связанные с плохим запросом',
    content: changeEmailBadRequestExample,
  })
  @ApiUnauthorizedResponse({
    description: 'Неверный текущий пароль или ошибка авторизации',
    content: changeEmailUnauthorizedExample,
  })
  @ApiConflictResponse({
    description: 'Email уже используется',
    type: DetailedInfoErrorResponseType,
    example: changeEmailConflictExample,
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample(changeEmailPathExample),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample(changeEmailPathExample),
  })
  async changeEmail(
    @CurrentUser() user: IJwtTokenPayload,
    @Body() dto: ChangeEmailDto,
  ): Promise<ChangeEmailResponseDto> {
    const result = await this.changeEmailUseCase.execute(user.id, dto);

    return new ChangeEmailResponseDto(result);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle(FOLLOW_WRITE_THROTTLE)
  @ApiOperation({
    summary: 'Удаление аккаунта',
    description:
      'Требует текущий пароль в теле запроса. Удаляет пользователя, его подписки (счётчики других пользователей пересчитываются), заявки и блокировки; все сессии завершаются, refresh cookie очищается.',
  })
  @ApiNoContentResponse({ description: 'Аккаунт удалён.' })
  @ApiBadRequestResponse({
    description: 'Ошибки валидации',
    type: ValidationErrorResponseType,
    example: deleteAccountBadRequestExample,
  })
  @ApiUnauthorizedResponse({
    description: 'Неверный текущий пароль или ошибка авторизации',
    content: deleteAccountUnauthorizedExample,
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample(deleteAccountPathExample),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample(deleteAccountPathExample),
  })
  async deleteAccount(
    @CurrentUser() user: IJwtTokenPayload,
    @Body() dto: ConfirmPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.deleteAccountUseCase.execute(user.id, dto);

    clearRefreshTokenCookie(res, this.configService);
  }

  @Post('deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle(FOLLOW_WRITE_THROTTLE)
  @ApiOperation({
    summary: 'Деактивация аккаунта',
    description:
      'Требует текущий пароль. Аккаунт скрывается из профилей и списков, все сессии завершаются, refresh cookie очищается. Подписки сохраняются. Вход с верным паролем восстанавливает аккаунт.',
  })
  @ApiNoContentResponse({ description: 'Аккаунт деактивирован.' })
  @ApiBadRequestResponse({
    description: 'Ошибки валидации',
    type: ValidationErrorResponseType,
    example: deactivateAccountBadRequestExample,
  })
  @ApiUnauthorizedResponse({
    description: 'Неверный текущий пароль или ошибка авторизации',
    content: deactivateAccountUnauthorizedExample,
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample(deactivateAccountPathExample),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample(deactivateAccountPathExample),
  })
  async deactivateAccount(
    @CurrentUser() user: IJwtTokenPayload,
    @Body() dto: ConfirmPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.deactivateAccountUseCase.execute(user.id, dto);

    clearRefreshTokenCookie(res, this.configService);
  }
}
