import { Inject, Injectable } from '@nestjs/common';
import { User } from '@domain/User/entities/user.entity';
import {
  IRefreshTokenDbRepository,
  REFRESH_TOKEN_DB_REPOSITORY,
} from '@domain/Jwt/repositories/refreshToken.db.repository.inter';
import { UserTokenVersionService } from '@application/Jwt/services/userTokenVersion.service';

@Injectable()
export class RevokeUserSessionsService {
  constructor(
    @Inject(REFRESH_TOKEN_DB_REPOSITORY)
    private readonly refreshTokenDbRepository: IRefreshTokenDbRepository,
    private readonly userTokenVersionService: UserTokenVersionService,
  ) {}

  // Завершает все сессии пользователя: удаляет refresh сессию и инкрементирует
  // версию токенов (выданные access/refresh токены перестают проходить проверку).
  // Возвращает новую версию — с ней выпускается новая пара, если нужна.
  // username — текущий в БД (сессия хранится по нему).
  async revokeAll(user: Pick<User, 'id' | 'username'>): Promise<number> {
    await this.refreshTokenDbRepository.deleteByUsername(user.username);

    return this.userTokenVersionService.bump(user.id);
  }
}
