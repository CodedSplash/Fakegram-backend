import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { UsernameVO } from '@domain/User/value-objects/username.vo';
import { UserProfile } from '@domain/User/types/userProfile.type';

export const USER_PROFILE_CACHE_REPOSITORY = Symbol(
  'USER_PROFILE_CACHE_REPOSITORY',
);

export interface IUserProfileCacheRepository {
  getByUsername(username: UsernameVO): Promise<UserProfile | null>;
  set(profile: UserProfile): Promise<void>;
  invalidate(userIds: UserIdVO[]): Promise<void>;
}
