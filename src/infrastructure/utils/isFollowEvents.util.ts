import { FollowEvent } from '@domain/Follow/events/follow.event.type';

export const isFollowEvent = (data: unknown): data is FollowEvent => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    typeof data.id === 'string' &&
    'type' in data &&
    typeof data.type === 'string' &&
    (data.type === 'follow' || data.type === 'unfollow') &&
    'payload' in data &&
    typeof data.payload === 'object' &&
    data.payload !== null &&
    'id' in data.payload &&
    typeof data.payload.id === 'string' &&
    'followerId' in data.payload &&
    typeof data.payload.followerId === 'string' &&
    'followingId' in data.payload &&
    typeof data.payload.followingId === 'string' &&
    'createdAt' in data.payload &&
    typeof data.payload.createdAt === 'string'
  );
};
