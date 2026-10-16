export interface BlockListInputDto {
  // Чьи блокировки — текущий пользователь.
  readonly userId: string;
  readonly limit: number;
  readonly cursor?: string;
}
