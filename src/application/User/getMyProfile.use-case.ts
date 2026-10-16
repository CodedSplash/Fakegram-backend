import { Inject, Injectable } from '@nestjs/common';
import { AuthorizationError } from '@domain/Jwt/errors/jwt.errors';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { OwnProfileOutputDto } from '@application/User/dtos/ownProfile.output.dto';
import { toOwnProfile } from '@application/User/utils/userProfile.util';
import {
  IUserDbRepository,
  USER_DB_REPOSITORY,
} from '@domain/User/repositories/user.db.repository.inter';

@Injectable()
export class GetMyProfileUseCase {
  constructor(
    @Inject(USER_DB_REPOSITORY)
    private readonly userDbRepository: IUserDbRepository,
  ) {}

  // Читаем из БД без кэша: в кэше только публичная часть профиля.
  async execute(userId: string): Promise<OwnProfileOutputDto> {
    const user = await this.userDbRepository.findById(new UserIdVO(userId));

    // Токен ещё жив, а аккаунт удалён или деактивирован.
    if (!user || !user.isActive) {
      throw new AuthorizationError();
    }

    return toOwnProfile(user);
  }
}
