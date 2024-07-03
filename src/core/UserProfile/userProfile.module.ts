import { Module } from '@nestjs/common';
import { UserProfileRepository } from '../../infrastructure/repositories/UserProfile/userProfile.repository';

@Module({
  providers: [UserProfileRepository],
})
export class UserProfileModule {}
