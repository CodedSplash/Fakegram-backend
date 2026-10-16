export interface FollowListItem {
  followId: string;
  id: string;
  username: string;
  displayName: string | null;
  profilePhotoUrl: string | null;
  isVerified: boolean;
  followedAt: Date;
}

// Позиция в списке: последняя выданная запись (createdAt DESC, id DESC).
export interface FollowListCursor {
  createdAt: Date;
  followId: string;
}
