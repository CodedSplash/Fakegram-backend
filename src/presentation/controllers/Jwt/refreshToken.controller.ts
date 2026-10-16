import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Public } from '@presentation/decorators/isPublic.decorator';
import { CurrentUser } from '@presentation/decorators/currentUser.decorator';
import { IJwtTokenPayload } from '@domain/Jwt/types/jwtTokenPayload.interface';
import { RefreshTokenResponseDto } from '@presentation/dtos/Jwt/refreshTokenResponse.dto';
import { internalServerErrorExample } from '@presentation/swagger/examples/general/internalServerError.example';
import { throttlerExceptionExample } from '@presentation/swagger/examples/general/throttlerException.example';
import { refreshTokenResponseExample } from '@presentation/swagger/examples/Jwt/refreshTokenResponse.example';
import { refreshTokenUnauthorized } from '@presentation/swagger/examples/Jwt/refreshTokenUnauthorized.example';
import { logoutUnauthorized } from '@presentation/swagger/examples/Jwt/logoutUnauthorized.example';
import { DefaultErrorResponseType } from '@presentation/types/defaultErrorResponse.type';
import { DetailedInfoErrorResponseType } from '@presentation/types/DetailedInfoErrorResponse.type';
import { RefreshTokenUseCase } from '@application/Jwt/refreshToken.use-case';
import { LogoutUseCase } from '@application/Jwt/logout.use-case';
import {
  clearRefreshTokenCookie,
  REFRESH_TOKEN_COOKIE_NAME,
  setRefreshTokenCookie,
} from '@presentation/utils/refreshTokenCookie.util';

@Controller('jwt')
@ApiTags('Jwt tokens')
@ApiExtraModels(DetailedInfoErrorResponseType)
export class RefreshTokenController {
  constructor(
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Put('refresh_token')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Обновление access и refresh токенов',
    description:
      'Этот эндпоинт использует refresh токен из cookie для обновления токенов.',
  })
  @ApiOkResponse({
    description: 'Токены были успешно обновлены!',
    type: RefreshTokenResponseDto,
    example: refreshTokenResponseExample,
  })
  @ApiUnauthorizedResponse({
    description: 'Ошибки авторизации',
    content: refreshTokenUnauthorized,
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample('/jwt_token/refresh_token'),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample('/jwt_token/refresh_token/'),
  })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME] as string;

    const tokens = await this.refreshTokenUseCase.execute(refreshToken);

    setRefreshTokenCookie(res, tokens.refreshToken, this.configService);

    return new RefreshTokenResponseDto(tokens);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Выход из аккаунта',
    description:
      'Удаляет refresh токен пользователя, отзывает выданные access токены (завершает сессию) и очищает cookie.',
  })
  @ApiNoContentResponse({
    description: 'Вы успешно вышли из аккаунта!',
  })
  @ApiUnauthorizedResponse({
    description: 'Ошибки авторизации',
    content: logoutUnauthorized,
  })
  async logout(
    @CurrentUser() user: IJwtTokenPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.logoutUseCase.execute(user.id, user.username);

    clearRefreshTokenCookie(res, this.configService);
  }
}
