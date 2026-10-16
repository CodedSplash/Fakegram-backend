import { User } from '@domain/User/entities/user.entity';
import { UserProfile } from '@domain/User/types/userProfile.type';
import { OwnProfileOutputDto } from '@application/User/dtos/ownProfile.output.dto';

// Только публичные поля: email, телефон, дата рождения и хеш пароля не попадают
// ни в ответ, ни в кэш.
export const toUserProfile = (user: User): UserProfile => ({
  id: user.id.toString(),
  username: user.username.toString(),
  displayName: user.displayName,
  bio: user.bio,
  profilePhotoUrl: user.profilePhotoUrl,
  websiteUrl: user.websiteUrl,
  isVerified: user.isVerified,
  isPrivate: user.isPrivate,
  followersCount: user.followersCount,
  followingsCount: user.followingsCount,
  createdAt: user.createdAt,
});

// Хеш пароля не отдаётся даже владельцу.
export const toOwnProfile = (user: User): OwnProfileOutputDto => ({
  ...toUserProfile(user),
  email: user.email.toString(),
  phoneNumber: user.phoneNumber.toString(),
  dateOfBirth: user.dateOfBirth.value,
  gender: user.gender,
  emailVerified: user.emailVerified,
  lastLoginAt: user.lastLoginAt,
});
