import { Injectable } from '@nestjs/common';
import { UserRegistrationDto } from '@presentation/dtos/Auth/userRegistration.dto';
import { IUserAuth } from '@domain/Auth/entities/userAuth.entity';
import { IUserAuthRepository } from '@domain/Auth/repositories/userAuth.repository.interface';
import { PrismaService } from '@infrastructure/db/orm/prisma.service';
import UserAuthMapper from '@infrastructure/mappers/Auth/userAuth.mapper';

@Injectable()
export class UserAuthRepository implements IUserAuthRepository {
  constructor(private readonly orm: PrismaService) {}

  async getUser(username: string): Promise<IUserAuth | null> {
    const user = await this.orm.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) return null;

    return UserAuthMapper.toDomain(user);
  }

  async createUser(dto: UserRegistrationDto): Promise<IUserAuth> {
    const user = await this.orm.user.create({
      data: {
        name: dto.name,
        username: dto.username,
        email: dto.email,
        password: dto.password,
        fullDateBirth: dto.fullDateBirth,
      },
    });

    return UserAuthMapper.toDomain(user);
  }
}
