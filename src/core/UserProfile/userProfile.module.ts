import { Module } from '@nestjs/common';
import { UserProfileController } from '../../application/controllers/UserProfile/userProfile.controller';
import { UserProfileRepository } from '../../infrastructure/repositories/UserProfile/userProfile.repository';
import { UserProfileService } from './servicies/userProfile.service';

@Module({
  controllers: [UserProfileController],
  providers: [UserProfileRepository, UserProfileService],
  exports: [UserProfileService],
})
export class UserProfileModule {}
