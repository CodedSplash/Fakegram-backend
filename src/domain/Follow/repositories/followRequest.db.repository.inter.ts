import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { Follow } from '@domain/Follow/entities/follow.entity';
import { FollowRequest } from '@domain/Follow/entities/followRequest.entity';
import {
  AcceptFollowRequestsBatchResult,
  FollowRequestListCursor,
  FollowRequestListItem,
} from '@domain/Follow/types/followRequestListItem.type';

export const FOLLOW_REQUEST_DB_REPOSITORY = Symbol(
  'FOLLOW_REQUEST_DB_REPOSITORY',
);

export interface IFollowRequestDbRepository {
  save(request: FollowRequest): Promise<void>;
  // Удаляет запрос follow.followerId -> follow.followingId и создаёт подписку
  // с outbox-событием в одной транзакции.
  accept(follow: Follow): Promise<void>;
  delete(requesterId: UserIdVO, targetId: UserIdVO): Promise<void>;
  findIncoming(
    targetId: UserIdVO,
    limit: number,
    cursor?: FollowRequestListCursor,
  ): Promise<FollowRequestListItem[]>;
  // Принимает до limit самых старых запросов владельца одной транзакцией.
  acceptBatch(
    ownerId: UserIdVO,
    limit: number,
  ): Promise<AcceptFollowRequestsBatchResult>;
}
