import { Injectable } from '@nestjs/common';
import { UserRegistrationDto } from 'src/application/dtos/Auth/userRegistration.dto';
import { IUserAuth } from 'src/core/Auth/entities/userAuth.entity';
import { IUserAuthRepository } from '../../../core/Auth/repositories/userAuth.repository.interface';
import { PrismaService } from '../../db/orm/prisma.service';
import UserAuthMapper from '../../mappers/Auth/userAuth.mapper';

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
