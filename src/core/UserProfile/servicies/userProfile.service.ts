import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserProfileRepository } from '../../../infrastructure/repositories/UserProfile/userProfile.repository';
import { IUserProfile } from '../entities/userProfile.entity';
import { IUserProfileRepository } from '../repositories/userProfile.repository.interface';
import { IUserProfileService } from './userProfile.service.interface';

@Injectable()
export class UserProfileService implements IUserProfileService {
  constructor(
    @Inject(UserProfileRepository)
    private readonly userProfileRepository: IUserProfileRepository,
  ) {}

  async getByUsername(username: string): Promise<IUserProfile> {
    return await this.userProfileRepository.getByUsername(username);
  }

  async hasUser(username: string): Promise<IUserProfile> {
    const user = await this.userProfileRepository.getByUsername(username);

    if (!user) throw new NotFoundException('Пользователь не найден!');

    return user;
  }
}
