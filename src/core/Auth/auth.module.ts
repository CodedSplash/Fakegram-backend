import { Module } from '@nestjs/common';
import { UserAuthRepository } from '../../infrastructure/repositories/Auth/userAuth.repository';
import { JwtModule } from '../Jwt/jwt.module';
import { UserProfileModule } from '../UserProfile/userProfile.module';

@Module({
  imports: [JwtModule, UserProfileModule],
  providers: [UserAuthRepository],
})
export class AuthModule {}
