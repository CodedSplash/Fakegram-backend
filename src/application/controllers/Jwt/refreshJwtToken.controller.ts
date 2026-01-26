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
import { Public } from '../../decorators/isPublic.decorator';
import { JwtTokenService } from '../../../core/Jwt/servicies/jwtToken.service';
import { IJwtTokenService } from '../../../core/Jwt/servicies/jwtToken.service.interface';
import { RefreshTokenResponseDto } from '../../dtos/Jwt/refreshTokenResponse.dto';
import { internalServerErrorExample } from 'src/application/swagger/examples/general/internalServerError.example';
import { throttlerExceptionExample } from 'src/application/swagger/examples/general/throttlerException.example';
import { refreshTokenResponseExample } from 'src/application/swagger/examples/Jwt/refreshTokenResponse.example';
import { refreshTokenUnauthorized } from 'src/application/swagger/examples/Jwt/refreshTokenUnauthorized.example';
import { hasUserNotFoundExample } from 'src/application/swagger/examples/UserProfile/hasUserNotFound.example';
import { DefaultErrorResponseType } from 'src/application/types/defaultErrorResponse.type';
import { DetailedInfoErrorResponseType } from 'src/application/types/DetailedInfoErrorResponse.type';

@Controller('jwt_token')
@ApiTags('Jwt token')
@ApiExtraModels(DetailedInfoErrorResponseType)
export class RefreshJwtTokenController {
  constructor(
    @Inject(JwtTokenService) private readonly jwtTokenService: IJwtTokenService,
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
