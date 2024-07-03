import { Module } from '@nestjs/common';
import { UserAuthRepository } from '../../infrastructure/repositories/Auth/userAuth.repository';

@Module({
  providers: [UserAuthRepository],
})
export class AuthModule {}
