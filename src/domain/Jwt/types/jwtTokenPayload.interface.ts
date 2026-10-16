import { Role } from '@prisma-client/generated/prisma/enums';

export interface IJwtTokenPayload {
  id: string;
  username: string;
  roles: Role[];
  // Версия токенов пользователя (users.tokenVersion). Отсутствует у токенов,
  // выданных до её появления, — трактуется как 0 (INITIAL_TOKEN_VERSION)
  tv?: number;
}
