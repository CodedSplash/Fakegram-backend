import { FollowRequestListItem } from '@domain/Follow/types/followRequestListItem.type';

export interface FollowRequestListOutputDto {
  readonly items: Omit<FollowRequestListItem, 'requestId'>[];
  readonly nextCursor: string | null;
}
