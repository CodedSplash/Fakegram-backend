import { FollowStatus } from '@domain/Follow/types/followRelation.type';

export interface IsFollowingOutputDto {
  readonly isFollowing: boolean;
  readonly status: FollowStatus;
}
