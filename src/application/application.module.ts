import { Module } from '@nestjs/common';
import { RegistrationUseCase } from '@application/Auth/registration.use-case';
import { LoginUseCase } from '@application/Auth/login.use-case';
import { RefreshTokenUseCase } from '@application/Jwt/refreshToken.use-case';
import { LogoutUseCase } from '@application/Jwt/logout.use-case';
import { SecurityModule } from '@infrastructure/security/security.module';
import { HasUserUseCase } from '@application/User/hasUser.use-case';
import { RepositoryDbModule } from '@infrastructure/db/repositories/repository.db.module';
import { FollowUseCase } from '@application/Follow/follow.use-case';
import { UnfollowUseCase } from '@application/Follow/unfollow.use-case';
import { RepositoryRedisModule } from '@infrastructure/cache/redis/repositories/repository.redis.module';
import { FollowBatchUseCase } from '@application/Follow/followBatch.use-case';
import { GetFollowersUseCase } from '@application/Follow/getFollowers.use-case';
import { GetFollowingsUseCase } from '@application/Follow/getFollowings.use-case';
import { IsFollowingUseCase } from '@application/Follow/isFollowing.use-case';
import { GetFollowRequestsUseCase } from '@application/Follow/getFollowRequests.use-case';
import { AcceptFollowRequestUseCase } from '@application/Follow/acceptFollowRequest.use-case';
import { RejectFollowRequestUseCase } from '@application/Follow/rejectFollowRequest.use-case';
import { CancelFollowRequestUseCase } from '@application/Follow/cancelFollowRequest.use-case';
import { AcceptAllFollowRequestsUseCase } from '@application/Follow/acceptAllFollowRequests.use-case';
import { BlockUserUseCase } from '@application/Block/blockUser.use-case';
import { UnblockUserUseCase } from '@application/Block/unblockUser.use-case';
import { GetBlockedUsersUseCase } from '@application/Block/getBlockedUsers.use-case';
import { GetUserProfileUseCase } from '@application/User/getUserProfile.use-case';
import { GetMyProfileUseCase } from '@application/User/getMyProfile.use-case';
import { UpdateMyProfileUseCase } from '@application/User/updateMyProfile.use-case';
import { TokenIssuerService } from '@application/Jwt/services/tokenIssuer.service';
import { ChangePasswordUseCase } from '@application/User/changePassword.use-case';
import { ChangeUsernameUseCase } from '@application/User/changeUsername.use-case';
import { ChangeEmailUseCase } from '@application/User/changeEmail.use-case';
import { DeleteAccountUseCase } from '@application/User/deleteAccount.use-case';
import { DeactivateAccountUseCase } from '@application/User/deactivateAccount.use-case';
import { UserTokenVersionService } from '@application/Jwt/services/userTokenVersion.service';
import { RevokeUserSessionsService } from '@application/Jwt/services/revokeUserSessions.service';
import { ValidateAccessTokenUseCase } from '@application/Jwt/validateAccessToken.use-case';

@Module({
  imports: [RepositoryDbModule, RepositoryRedisModule, SecurityModule],
  providers: [
    RegistrationUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    HasUserUseCase,
    FollowUseCase,
    UnfollowUseCase,
    FollowBatchUseCase,
    GetFollowersUseCase,
    GetFollowingsUseCase,
    IsFollowingUseCase,
    GetUserProfileUseCase,
    GetMyProfileUseCase,
    UpdateMyProfileUseCase,
    TokenIssuerService,
    ChangePasswordUseCase,
    ChangeUsernameUseCase,
    ChangeEmailUseCase,
    DeleteAccountUseCase,
    DeactivateAccountUseCase,
    UserTokenVersionService,
    RevokeUserSessionsService,
    ValidateAccessTokenUseCase,
    GetFollowRequestsUseCase,
    AcceptFollowRequestUseCase,
    RejectFollowRequestUseCase,
    CancelFollowRequestUseCase,
    AcceptAllFollowRequestsUseCase,
    BlockUserUseCase,
    UnblockUserUseCase,
    GetBlockedUsersUseCase,
  ],
  exports: [
    RegistrationUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    HasUserUseCase,
    FollowUseCase,
    UnfollowUseCase,
    FollowBatchUseCase,
    GetFollowersUseCase,
    GetFollowingsUseCase,
    IsFollowingUseCase,
    GetUserProfileUseCase,
    GetMyProfileUseCase,
    UpdateMyProfileUseCase,
    ChangePasswordUseCase,
    ChangeUsernameUseCase,
    ChangeEmailUseCase,
    DeleteAccountUseCase,
    DeactivateAccountUseCase,
    RevokeUserSessionsService,
    ValidateAccessTokenUseCase,
    GetFollowRequestsUseCase,
    AcceptFollowRequestUseCase,
    RejectFollowRequestUseCase,
    CancelFollowRequestUseCase,
    AcceptAllFollowRequestsUseCase,
    BlockUserUseCase,
    UnblockUserUseCase,
    GetBlockedUsersUseCase,
  ],
})
export class ApplicationModule {}
