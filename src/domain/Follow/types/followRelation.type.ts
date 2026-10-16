export type FollowStatus = 'none' | 'requested' | 'following';

// Состояние пары (viewer -> target) одним запросом: для подписки и блокировки.
export interface FollowRelation {
  isActive: boolean;
  isPrivate: boolean;
  // Существует ли сам viewer (токен мог пережить удаление пользователя).
  isViewerExists: boolean;
  isFollowing: boolean;
  isRequested: boolean;
  // Блокировка в любую сторону.
  isBlocked: boolean;
}
