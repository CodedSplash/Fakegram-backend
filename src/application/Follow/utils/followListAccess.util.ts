import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { IFollowDbRepository } from '@domain/Follow/repositories/follow.db.repository.inter';
import {
  PrivateAccountError,
  UserNotFoundError,
} from '@domain/User/errors/user.errors';

// Списки деактивированного пользователя не отдаются никому (404).
// При блокировке в любую сторону — тоже 404: блокировка не раскрывается.
// Списки закрытого аккаунта видят только владелец и его подписчики (403).
export const assertCanViewFollowList = async (
  followDbRepository: IFollowDbRepository,
  ownerId: UserIdVO,
  viewerId: UserIdVO,
): Promise<void> => {
  const access = await followDbRepository.findFollowListAccess(
    ownerId,
    viewerId,
  );

  if (!access || !access.isActive || access.isBlocked) {
    throw new UserNotFoundError();
  }

  if (
    access.isPrivate &&
    !ownerId.equals(viewerId) &&
    !access.isViewerFollowing
  ) {
    throw new PrivateAccountError();
  }
};
