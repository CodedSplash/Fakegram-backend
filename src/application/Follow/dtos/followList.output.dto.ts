import { FollowListItem } from '@domain/Follow/types/followListItem.type';

export interface FollowListOutputDto {
  readonly items: Omit<FollowListItem, 'followId'>[];
  readonly nextCursor: string | null;
}
