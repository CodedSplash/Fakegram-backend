import { Injectable } from '@nestjs/common';
import { IUserProfile } from '@core/UserProfile/entities/userProfile.entity';
import { IUserProfileRepository } from '@core/UserProfile/repositories/userProfile.repository.interface';
import { PrismaService } from '@infrastructure/db/orm/prisma.service';
import UserMapper from '@infrastructure/mappers/UserProfile/userProfile.mapper';

@Injectable()
export class UserProfileRepository implements IUserProfileRepository {
  constructor(private readonly orm: PrismaService) {}

  async getByUsername(username: string): Promise<IUserProfile | null> {
    const user = await this.orm.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) return null;

    return UserMapper.toDomain(user);
  }
}
