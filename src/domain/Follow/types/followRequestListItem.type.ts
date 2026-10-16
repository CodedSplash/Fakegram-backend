export interface FollowRequestListItem {
  requestId: string;
  id: string;
  username: string;
  displayName: string | null;
  profilePhotoUrl: string | null;
  isVerified: boolean;
  requestedAt: Date;
}

// Позиция в списке: последняя выданная запись (createdAt DESC, id DESC).
export interface FollowRequestListCursor {
  createdAt: Date;
  requestId: string;
}

export interface AcceptFollowRequestsBatchResult {
  // Сколько запросов выбрано в пачку (меньше лимита — запросов больше нет).
  selected: number;
  // Сколько подписок реально создано.
  accepted: number;
}
