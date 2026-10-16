import { Inject, Injectable, Logger } from '@nestjs/common';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import {
  IUserDbRepository,
  USER_DB_REPOSITORY,
} from '@domain/User/repositories/user.db.repository.inter';
import {
  IUserTokenVersionCacheRepository,
  USER_TOKEN_VERSION_CACHE_REPOSITORY,
} from '@domain/User/repositories/userTokenVersion.cache.repository.inter';

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

@Injectable()
export class UserTokenVersionService {
  private readonly logger = new Logger(UserTokenVersionService.name);

  constructor(
    @Inject(USER_DB_REPOSITORY)
    private readonly userDbRepository: IUserDbRepository,
    @Inject(USER_TOKEN_VERSION_CACHE_REPOSITORY)
    private readonly tokenVersionCacheRepository: IUserTokenVersionCacheRepository,
  ) {}

  // Текущая версия токенов активного пользователя; null — пользователя нет
  // или он деактивирован. Cache-aside: сбой Redis — идём в БД,
  // ошибка БД пробрасывается (запрос отклоняется, а не пропускается).
  async getCurrent(userId: UserIdVO): Promise<number | null> {
    try {
      const cached = await this.tokenVersionCacheRepository.get(userId);
      if (cached !== null) return cached;
    } catch (error: unknown) {
      this.logger.warn(
        `Token version cache read failed: ${errorMessage(error)}`,
      );
    }

    const state = await this.userDbRepository.findSessionState(userId);

    if (!state || !state.isActive) {
      return null;
    }

    try {
      await this.tokenVersionCacheRepository.setIfNewer(
        userId,
        state.tokenVersion,
      );
    } catch (error: unknown) {
      this.logger.warn(
        `Token version cache write failed: ${errorMessage(error)}`,
      );
    }

    return state.tokenVersion;
  }

  // Инкремент версии отзывает все выданные токены. Кэш обновляется строго
  // после записи в БД; возвращает новую версию для выпуска новой пары.
  async bump(userId: UserIdVO): Promise<number> {
    const tokenVersion =
      await this.userDbRepository.incrementTokenVersion(userId);

    try {
      await this.tokenVersionCacheRepository.setIfNewer(userId, tokenVersion);
    } catch (error: unknown) {
      // Старая версия в кэше пропускала бы отозванные токены до TTL —
      // хотя бы удаляем ключ
      try {
        await this.tokenVersionCacheRepository.invalidate(userId);
      } catch {
        this.logger.error(
          `Token version cache update failed, revoked tokens valid until TTL for user: ${userId.toString()}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    return tokenVersion;
  }
}
