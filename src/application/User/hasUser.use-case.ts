import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundError } from '@domain/User/errors/user.errors';
import { User } from '@domain/User/entities/user.entity';
import {
  IUserDbRepository,
  USER_DB_REPOSITORY,
} from '@domain/User/repositories/user.db.repository.inter';
import { UsernameVO } from '@domain/User/value-objects/username.vo';

@Injectable()
export class HasUserUseCase {
  constructor(
    @Inject(USER_DB_REPOSITORY)
    private readonly userDbRepository: IUserDbRepository,
  ) {}

  async execute(username: string): Promise<User> {
    const user = await this.userDbRepository.findByUsername(
      new UsernameVO(username),
    );

    if (!user) {
      throw new UserNotFoundError();
    }

    return user;
  }
}
