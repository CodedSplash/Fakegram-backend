import { Controller, Get, Inject, Param } from '@nestjs/common';
import { UserProfileService } from '../../../core/UserProfile/servicies/userProfile.service';
import { IUserProfileService } from '../../../core/UserProfile/servicies/userProfile.service.interface';
import { HasUserResponseDto } from '../../dtos/UserProfile/hasUserResponse.dto';

@Controller('user')
export class UserProfileController {
  constructor(
    @Inject(UserProfileService)
    private readonly userProfileService: IUserProfileService,
  ) {}

  @Get('has_user/:username')
  async hasUser(@Param('username') username: string) {
    const user = await this.userProfileService.hasUser(username);

    return new HasUserResponseDto(user);
  }
}
