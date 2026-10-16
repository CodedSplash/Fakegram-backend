export interface BlockListItem {
  id: string;
  username: string;
  displayName: string | null;
  profilePhotoUrl: string | null;
  isVerified: boolean;
  blockedAt: Date;
}

// Позиция в списке: последняя выданная запись (createdAt DESC, blockedId DESC).
export interface BlockListCursor {
  createdAt: Date;
  blockedId: string;
}
