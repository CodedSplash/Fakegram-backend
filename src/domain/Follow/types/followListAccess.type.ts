// Всё, что нужно для проверки доступа к спискам подписок, одним запросом.
export interface FollowListAccess {
  isActive: boolean;
  isPrivate: boolean;
  // Подписан ли просматривающий на владельца списков.
  isViewerFollowing: boolean;
  // Блокировка между владельцем и просматривающим в любую сторону.
  isBlocked: boolean;
}
