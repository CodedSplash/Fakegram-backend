export interface FollowRequestListInputDto {
  // Владелец входящих запросов — текущий пользователь.
  readonly userId: string;
  readonly limit: number;
  readonly cursor?: string;
}
