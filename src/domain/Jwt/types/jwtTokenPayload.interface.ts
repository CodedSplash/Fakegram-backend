import { Role } from '@prisma-client/generated/prisma/enums';

export interface IJwtTokenPayload {
  id: number;
  username: string;
  roles: Role[];
}
