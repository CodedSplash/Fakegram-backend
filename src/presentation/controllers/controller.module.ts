import { Module } from '@nestjs/common';
import { AuthController } from '@presentation/controllers/Auth/auth.controller';
import { RefreshTokenController } from '@presentation/controllers/Jwt/refreshToken.controller';
import { UserController } from '@presentation/controllers/User/user.controller';
import { MeController } from '@presentation/controllers/User/me.controller';
import { AccountController } from '@presentation/controllers/User/account.controller';
import { ApplicationModule } from '@application/application.module';
import { FollowController } from '@presentation/controllers/Follow/follow.controller';
import { FollowRequestController } from '@presentation/controllers/Follow/followRequest.controller';
import { BlockController } from '@presentation/controllers/User/block.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [
    AuthController,
    RefreshTokenController,
    UserController,
    MeController,
    AccountController,
    FollowController,
    FollowRequestController,
    BlockController,
  ],
})
export class ControllerModule {}
