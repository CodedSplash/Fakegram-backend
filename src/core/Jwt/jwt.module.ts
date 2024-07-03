import { Module } from '@nestjs/common';
import { RefreshJwtTokenController } from '../../application/controllers/Jwt/refreshJwtToken.controller';
import { RefreshJwtTokenRepository } from '../../infrastructure/repositories/Jwt/refreshJwtToken.repository';
import { UserProfileModule } from '../UserProfile/userProfile.module';
import { JwtTokenService } from './servicies/jwtToken.service';

@Module({
  imports: [UserProfileModule],
  controllers: [RefreshJwtTokenController],
  providers: [RefreshJwtTokenRepository, JwtTokenService],
  exports: [JwtTokenService],
})
export class JwtModule {}
