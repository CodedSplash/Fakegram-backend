import { Role } from '@prisma/client';

export interface IUserProfile {
  id: number;
  name?: string;
  username: string;
  country?: string;
  profilePhotoUrl?: string;
  roles: Role[];
  aboutMe?: string;
  registrationDate?: Date;
  isVerified?: boolean;
  isPrivate?: boolean;
}
