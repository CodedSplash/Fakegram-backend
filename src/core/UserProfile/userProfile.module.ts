import { Module } from '@nestjs/common';
import { UserProfileRepository } from '../../infrastructure/repositories/UserProfile/userProfile.repository';
import { UserProfileService } from './servicies/userProfile.service';

@Module({
  providers: [UserProfileRepository, UserProfileService],
  exports: [UserProfileService],
})
export class UserProfileModule {}
