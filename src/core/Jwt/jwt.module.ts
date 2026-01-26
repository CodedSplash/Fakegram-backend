import { Module } from '@nestjs/common';
import { RefreshJwtTokenController } from '@application/controllers/Jwt/refreshJwtToken.controller';
import { RefreshJwtTokenRepository } from '@infrastructure/repositories/Jwt/refreshJwtToken.repository';
import { UserProfileModule } from '@core/UserProfile/userProfile.module';
import { JwtTokenService } from '@core/Jwt/servicies/jwtToken.service';

@Module({
  imports: [UserProfileModule],
  controllers: [RefreshJwtTokenController],
  providers: [RefreshJwtTokenRepository, JwtTokenService],
  exports: [JwtTokenService],
})
export class JwtModule {}
