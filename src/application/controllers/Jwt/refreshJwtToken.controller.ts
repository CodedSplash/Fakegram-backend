import { Controller, Inject, Put, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtTokenService } from '../../../core/Jwt/servicies/jwtToken.service';
import { IJwtTokenService } from '../../../core/Jwt/servicies/jwtToken.service.interface';
import { RefreshTokenResponseDto } from '../../dtos/Jwt/refreshTokenResponse.dto';

@Controller('jwt_token')
export class RefreshJwtTokenController {
  constructor(
    @Inject(JwtTokenService) private readonly jwtTokenService: IJwtTokenService,
  ) {}

  @Put('refresh_token')
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
