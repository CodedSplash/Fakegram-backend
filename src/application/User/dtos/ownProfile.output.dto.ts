import { Gender } from '@domain/User/enums/user.enum';
import { UserProfile } from '@domain/User/types/userProfile.type';

// Профиль владельца: публичная часть + приватные поля, видимые только ему.
export interface OwnProfileOutputDto extends UserProfile {
  readonly email: string;
  readonly phoneNumber: string;
  readonly dateOfBirth: Date;
  readonly gender: Gender | null;
  readonly emailVerified: boolean;
  readonly lastLoginAt: Date | null;
}
