export interface FollowListInputDto {
  readonly userId: string;
  // Кто запрашивает список — для проверки доступа к закрытому аккаунту.
  readonly viewerId: string;
  readonly limit: number;
  readonly cursor?: string;
}
