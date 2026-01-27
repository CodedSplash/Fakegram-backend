import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserProfile } from '@core/UserProfile/entities/userProfile.entity';
import { IUserProfileRepository } from '@core/UserProfile/repositories/userProfile.repository.interface';
import { UserProfileRepository } from '@infrastructure/repositories/UserProfile/userProfile.repository';

@Injectable()
export class HasUserUseCase {
  constructor(
    @Inject(UserProfileRepository)
    private readonly userProfileRepository: IUserProfileRepository,
  ) {}

  async execute(username: string): Promise<IUserProfile> {
    const user = await this.userProfileRepository.getByUsername(username);

    if (!user) {
      throw new NotFoundException('Пользователь не найден!');
    }

    return user;
  }
}
