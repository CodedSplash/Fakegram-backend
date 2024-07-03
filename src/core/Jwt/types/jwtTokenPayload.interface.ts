import { Role } from '@prisma/client';

export interface IJwtTokenPayload {
  id: number;
  username: string;
  roles: Role[];
}
