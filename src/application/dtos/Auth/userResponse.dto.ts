import { Role } from '@prisma/client';
import { GenerateDtoParameterType } from '../../../common/types/dtoParameter.type';

export class UserResponseDto {
  readonly id: number;
  readonly name?: string;
  readonly username: string;
  readonly country?: string;
  readonly profilePhotoUrl?: string;
  readonly roles: Role[];
  readonly aboutMe?: string;
  readonly registrationDate?: Date;
  readonly isVerified?: boolean;
  readonly isPrivate?: boolean;

  constructor(user: GenerateDtoParameterType<UserResponseDto>) {
    this.id = user.id;
    this.name = user.name;
    this.username = user.username;
    this.country = user.country;
    this.profilePhotoUrl = user.profilePhotoUrl;
    this.roles = user.roles;
    this.aboutMe = user.aboutMe;
    this.registrationDate = user.registrationDate;
    this.isVerified = user.isVerified;
    this.isPrivate = user.isPrivate;
  }
}
