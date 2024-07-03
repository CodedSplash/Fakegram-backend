import { Role } from '@prisma/client';

export interface IUserAuth {
  id: number;
  name?: string;
  username: string;
  email: string;
  password: string;
  country?: string;
  profilePhotoUrl?: string;
  fullDateBirth: Date;
  roles: Role[];
  aboutMe?: string;
  registrationDate?: Date;
  isVerified?: boolean;
  isPrivate?: boolean;
}
