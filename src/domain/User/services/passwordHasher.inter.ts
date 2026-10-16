export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');

// Порт хеширования паролей (реализация в infrastructure)
export interface IPasswordHasher {
  hash(plain: string): Promise<string>;
  // Сравнение в постоянном времени; false для некорректного хеша
  verify(plain: string, hash: string): Promise<boolean>;
  // true, если хеш устарел (legacy-алгоритм или старые параметры)
  needsRehash(hash: string): boolean;
}
