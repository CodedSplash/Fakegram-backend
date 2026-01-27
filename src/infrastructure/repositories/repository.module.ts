import { Module } from '@nestjs/common';
import { UserAuthRepository } from '@infrastructure/repositories/Auth/userAuth.repository';
import { RefreshJwtTokenRepository } from '@infrastructure/repositories/Jwt/refreshJwtToken.repository';
import { UserProfileRepository } from '@infrastructure/repositories/UserProfile/userProfile.repository';
import { DbModule } from '@infrastructure/db/db.module';

@Module({
  imports: [DbModule],
  providers: [
    UserAuthRepository,
    RefreshJwtTokenRepository,
    UserProfileRepository,
  ],
  exports: [
    UserAuthRepository,
    RefreshJwtTokenRepository,
    UserProfileRepository,
  ],
})
export class RepositoryModule {}
