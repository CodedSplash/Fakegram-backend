import { Module } from '@nestjs/common';
import { RefreshJwtTokenRepository } from '../../infrastructure/repositories/Jwt/refreshJwtToken.repository';
import { UserProfileModule } from '../UserProfile/userProfile.module';

@Module({
  imports: [UserProfileModule],
  providers: [RefreshJwtTokenRepository],
})
export class JwtModule {}
