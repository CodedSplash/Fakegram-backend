import { User } from '@domain/User/entities/user.entity';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { UsernameVO } from '@domain/User/value-objects/username.vo';
import { EmailVO } from '@domain/User/value-objects/email.vo';
import {
  UserLoginRecord,
  UserProfilePatch,
} from '@domain/User/types/userUpdate.type';
import { UserSessionState } from '@domain/User/types/userSessionState.type';

export const USER_DB_REPOSITORY = Symbol('USER_DB_REPOSITORY');

// Существующий пользователь обновляется только точечно (изменённые колонки),
// чтобы конкурентные запросы не затирали изменения друг друга.
// Методы update* бросают UserNotFoundError, если пользователя нет.
export interface IUserDbRepository {
  // Только для регистрации
  create(user: User): Promise<User>;
  updateProfile(id: UserIdVO, patch: UserProfilePatch): Promise<User>;
  updatePasswordHash(id: UserIdVO, passwordHash: string): Promise<User>;
  updateUsername(id: UserIdVO, username: UsernameVO): Promise<User>;
  // Сбрасывает emailVerified
  updateEmail(id: UserIdVO, email: EmailVO): Promise<User>;
  updateActive(id: UserIdVO, isActive: boolean): Promise<User>;
  recordLogin(id: UserIdVO, record: UserLoginRecord): Promise<User>;
  // Атомарный инкремент версии токенов, возвращает новую версию
  incrementTokenVersion(id: UserIdVO): Promise<number>;
  findSessionState(id: UserIdVO): Promise<UserSessionState | null>;
  // Удаляет пользователя вместе с подписками (по каждой — событие unfollow в outbox,
  // чтобы счётчики других пользователей сошлись), заявками и блокировками.
  // Возвращает число удалённых подписок; UserNotFoundError, если пользователя нет.
  deleteAccount(id: UserIdVO): Promise<number>;
  findById(id: UserIdVO): Promise<User | null>;
  findByUsername(username: UsernameVO): Promise<User | null>;
  existsByUsername(username: UsernameVO): Promise<boolean>;
  existsByEmail(email: EmailVO): Promise<boolean>;
}
