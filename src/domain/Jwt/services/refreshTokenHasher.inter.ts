export const REFRESH_TOKEN_HASHER = Symbol('REFRESH_TOKEN_HASHER');

// Порт хеширования refresh токенов (реализация в infrastructure)
export interface IRefreshTokenHasher {
  hash(token: string): string;
  // Сравнение в постоянном времени
  compare(token: string, tokenHash: string): boolean;
}
