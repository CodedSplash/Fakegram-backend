import {
  User as UserPrisma,
  Gender as GenderPrisma,
  Role as RolePrisma,
} from '@prisma-client/generated/prisma/client';
import { User } from '@domain/User/entities/user.entity';
import { DomainModelMapper } from '@infrastructure/types/domainModelMapper.type';
import { Gender, Role } from '@domain/User/enums/user.enum';

class UserMapper implements DomainModelMapper<User, UserPrisma> {
  toDomain(modelEntity: UserPrisma): User {
    const {
      id,
      username,
      email,
      passwordHash,
      phoneNumber,
      displayName,
      bio,
      profilePhotoUrl,
      dateOfBirth,
      gender,
      websiteUrl,
      roles,
      isVerified,
      isPrivate,
      isActive,
      emailVerified,
      followersCount,
      followingsCount,
      lastLoginAt,
      createdAt,
      updatedAt,
    } = modelEntity;

    return new User({
      id: id,
      username: username,
      email: email,
      passwordHash: passwordHash,
      phoneNumber: phoneNumber,
      displayName: displayName ? displayName : undefined,
      bio: bio ? bio : undefined,
      profilePhotoUrl: profilePhotoUrl ? profilePhotoUrl : undefined,
      dateOfBirth: dateOfBirth,
      gender: Gender[gender],
      websiteUrl: websiteUrl ? websiteUrl : undefined,
      roles: roles.map((role) => Role[role]),
      isVerified: isVerified,
      isPrivate: isPrivate,
      isActive: isActive,
      emailVerified: emailVerified,
      followersCount: followersCount,
      followingsCount: followingsCount,
      lastLoginAt: lastLoginAt,
      createdAt: createdAt,
      updatedAt: updatedAt,
    });
  }

  toModel(domainEntity: User): Partial<UserPrisma> {
    const {
      id,
      username,
      email,
      passwordHash,
      phoneNumber,
      displayName,
      bio,
      profilePhotoUrl,
      dateOfBirth,
      gender,
      websiteUrl,
      roles,
      isVerified,
      isPrivate,
      isActive,
      emailVerified,
      followersCount,
      followingsCount,
      lastLoginAt,
      createdAt,
      updatedAt,
    } = domainEntity;

    return {
      id: id.toString(),
      username: username.toString(),
      email: email.toString(),
      passwordHash: passwordHash,
      phoneNumber: phoneNumber.toString(),
      displayName: displayName ? displayName : undefined,
      bio: bio ? bio : undefined,
      profilePhotoUrl: profilePhotoUrl ? profilePhotoUrl : undefined,
      dateOfBirth: new Date(dateOfBirth.value.getTime()),
      gender: GenderPrisma[gender],
      websiteUrl: websiteUrl ? websiteUrl : undefined,
      roles: roles.map((role) => RolePrisma[role]),
      isVerified: isVerified,
      isPrivate: isPrivate,
      isActive: isActive,
      emailVerified: emailVerified,
      followersCount: followersCount,
      followingsCount: followingsCount,
      lastLoginAt: lastLoginAt,
      createdAt: createdAt,
      updatedAt: updatedAt,
    };
  }
}

export default new UserMapper();
