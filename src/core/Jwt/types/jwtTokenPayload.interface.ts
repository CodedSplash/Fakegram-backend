import { Role } from 'prisma/generated/prisma/enums';

export interface IJwtTokenPayload {
  id: number;
  username: string;
  roles: Role[];
}
