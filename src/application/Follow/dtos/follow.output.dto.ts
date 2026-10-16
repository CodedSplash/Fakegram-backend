import { FollowStatus } from '@domain/Follow/types/followRelation.type';

export interface FollowOutputDto {
  readonly isSuccess: boolean;
  readonly status: Exclude<FollowStatus, 'none'>;
  readonly message: string;
}
