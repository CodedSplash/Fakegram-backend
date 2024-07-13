import { Controller, Inject, Put, Req, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { internalServerErrorExample } from '../../../common/swagger/examples/general/internalServerError.example';
import { throttlerExceptionExample } from '../../../common/swagger/examples/general/throttlerException.example';
import { refreshTokenResponseExample } from '../../../common/swagger/examples/Jwt/refreshTokenResponse.example';
import { refreshTokenUnauthorized } from '../../../common/swagger/examples/Jwt/refreshTokenUnauthorized.example';
import { hasUserNotFoundExample } from '../../../common/swagger/examples/UserProfile/hasUserNotFound.example';
import { DefaultErrorResponseType } from '../../../common/types/defaultErrorResponse.type';

import { DetailedInfoErrorResponseType } from '../../../common/types/DetailedInfoErrorResponse.type';
import { JwtTokenService } from '../../../core/Jwt/servicies/jwtToken.service';
import { IJwtTokenService } from '../../../core/Jwt/servicies/jwtToken.service.interface';
import { RefreshTokenResponseDto } from '../../dtos/Jwt/refreshTokenResponse.dto';

@Controller('jwt_token')
@ApiTags('Jwt token')
@ApiExtraModels(DetailedInfoErrorResponseType)
export class RefreshJwtTokenController {
  constructor(
    @Inject(JwtTokenService) private readonly jwtTokenService: IJwtTokenService,
  ) {}

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
  @ApiNotFoundResponse({
    description: 'Пользователь не найден!',
    type: DetailedInfoErrorResponseType,
    example: hasUserNotFoundExample,
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
    const refreshToken = req.cookies['refreshToken'] as string;

    const tokens = await this.jwtTokenService.refreshToken(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return new RefreshTokenResponseDto(tokens);
  }
}
