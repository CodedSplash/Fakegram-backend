import { Module } from '@nestjs/common';
import { UserAuthController } from '@application/controllers/Auth/userAuth.controller';
import { RefreshJwtTokenController } from '@application/controllers/Jwt/refreshJwtToken.controller';
import { UserProfileController } from '@application/controllers/UserProfile/userProfile.controller';
import { UseCaseModule } from '@use-cases/use-case.module';

@Module({
  imports: [UseCaseModule],
  controllers: [
    UserAuthController,
    RefreshJwtTokenController,
    UserProfileController,
  ],
})
export class ControllerModule {}
