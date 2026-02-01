import { Module } from '@nestjs/common';
import { UserAuthController } from '@presentation/controllers/Auth/userAuth.controller';
import { RefreshJwtTokenController } from '@presentation/controllers/Jwt/refreshJwtToken.controller';
import { UserProfileController } from '@presentation/controllers/UserProfile/userProfile.controller';
import { ApplicationModule } from '@application/application.module';

@Module({
  imports: [ApplicationModule],
  controllers: [
    UserAuthController,
    RefreshJwtTokenController,
    UserProfileController,
  ],
})
export class ControllerModule {}
