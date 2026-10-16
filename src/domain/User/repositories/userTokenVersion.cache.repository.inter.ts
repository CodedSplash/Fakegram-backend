import { UserIdVO } from '@domain/User/value-objects/userId.vo';

export const USER_TOKEN_VERSION_CACHE_REPOSITORY = Symbol(
  'USER_TOKEN_VERSION_CACHE_REPOSITORY',
);

export interface IUserTokenVersionCacheRepository {
  get(userId: UserIdVO): Promise<number | null>;
  // Версия только растёт: запись меньшего значения поверх большего
  // игнорируется, поэтому запоздалое заполнение кэша из БД не откатит отзыв
  setIfNewer(userId: UserIdVO, tokenVersion: number): Promise<void>;
  invalidate(userId: UserIdVO): Promise<void>;
}
