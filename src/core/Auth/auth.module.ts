import { Module } from '@nestjs/common';
import { UserAuthController } from '../../application/controllers/Auth/userAuth.controller';
import { UserAuthRepository } from '../../infrastructure/repositories/Auth/userAuth.repository';
import { JwtModule } from '../Jwt/jwt.module';
import { UserProfileModule } from '../UserProfile/userProfile.module';
import { UserAuthService } from './servicies/userAuth.service';

@Module({
  imports: [JwtModule, UserProfileModule],
  providers: [UserAuthRepository, UserAuthService],
  controllers: [UserAuthController],
})
export class AuthModule {}
