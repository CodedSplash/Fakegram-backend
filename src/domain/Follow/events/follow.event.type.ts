export type FollowEventType = 'follow' | 'unfollow';

export interface FollowEventPayload {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FollowEvent {
  id: string;
  type: FollowEventType;
  payload: FollowEventPayload;
}
