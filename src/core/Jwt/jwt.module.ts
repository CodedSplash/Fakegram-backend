import { Module } from '@nestjs/common';
import { RefreshJwtTokenRepository } from '../../infrastructure/repositories/Jwt/refreshJwtToken.repository';

@Module({
  providers: [RefreshJwtTokenRepository],
})
export class JwtModule {}
