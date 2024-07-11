import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserAuthService } from '../../../core/Auth/servicies/userAuth.service';
import { IUserAuthService } from '../../../core/Auth/servicies/userAuth.service.interface';
import { UserRegistrationDto } from '../../dtos/Auth/userRegistration.dto';
import { UserResponseDto } from '../../dtos/Auth/userResponse.dto';

@Controller('auth')
export class UserAuthController {
  constructor(
    @Inject(UserAuthService) private readonly userAuthService: IUserAuthService,
  ) {}

  @Post('registration')
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
