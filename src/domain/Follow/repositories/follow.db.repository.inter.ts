import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { Follow } from '@domain/Follow/entities/follow.entity';
import { FollowEvent } from '@domain/Follow/events/follow.event.type';
import { FollowListAccess } from '@domain/Follow/types/followListAccess.type';
import { FollowRelation } from '@domain/Follow/types/followRelation.type';
import {
  FollowListCursor,
  FollowListItem,
} from '@domain/Follow/types/followListItem.type';

export const FOLLOW_DB_REPOSITORY = Symbol('FOLLOW_DB_REPOSITORY');

export interface IFollowDbRepository {
  save(follow: Follow): Promise<Follow>;
  deleteByFollowerAndFollowingId(
    followerId: UserIdVO,
    followingId: UserIdVO,
  ): Promise<void>;
  // viewerId — пользователи, связанные с ним блокировкой, исключаются.
  findFollowers(
    userId: UserIdVO,
    viewerId: UserIdVO,
    limit: number,
    cursor?: FollowListCursor,
  ): Promise<FollowListItem[]>;
  // viewerId — пользователи, связанные с ним блокировкой, исключаются.
  findFollowings(
    userId: UserIdVO,
    viewerId: UserIdVO,
    limit: number,
    cursor?: FollowListCursor,
  ): Promise<FollowListItem[]>;
  // null — владельца списков не существует.
  findFollowListAccess(
    ownerId: UserIdVO,
    viewerId: UserIdVO,
  ): Promise<FollowListAccess | null>;
  // null — target не существует.
  findRelation(
    viewerId: UserIdVO,
    targetId: UserIdVO,
  ): Promise<FollowRelation | null>;
  // Возвращает пользователей, у которых изменились счётчики.
  applyBatch(events: FollowEvent[]): Promise<UserIdVO[]>;
}
