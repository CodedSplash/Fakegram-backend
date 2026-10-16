import { ApiProperty } from '@nestjs/swagger';
import { GenerateDtoParameterType } from '@presentation/types/dtoParameter.type';
import { Gender, Role } from '@domain/User/enums/user.enum';

export class UserResponseDto {
  @ApiProperty()
  readonly id: string;

  @ApiProperty({
    required: false,
  })
  readonly displayName?: string;

  @ApiProperty()
  readonly username: string;

  @ApiProperty()
  readonly profilePhotoUrl?: string;

  @ApiProperty({
    enum: Role,
    enumName: 'Role',
    isArray: true,
  })
  readonly roles: Role[];

  @ApiProperty({
    required: false,
    nullable: true,
  })
  readonly bio: string;

  @ApiProperty({
    required: false,
  })
  readonly createdAt: Date;

  @ApiProperty({
    required: false,
  })
  readonly isVerified: boolean;

  @ApiProperty({
    required: false,
  })
  readonly isPrivate: boolean;

  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly phoneNumber: string;

  @ApiProperty()
  readonly dateOfBirth: Date;

  @ApiProperty({
    required: false,
  })
  readonly gender: Gender;

  @ApiProperty({
    required: false,
  })
  readonly websiteUrl?: string;

  @ApiProperty({
    required: false,
  })
  readonly isActive: boolean;

  @ApiProperty({
    required: false,
  })
  readonly emailVerified: boolean;

  @ApiProperty({
    required: false,
  })
  readonly followersCount: number;

  @ApiProperty({
    required: false,
  })
  readonly followingsCount: number;

  constructor(user: GenerateDtoParameterType<UserResponseDto>) {
    this.id = user.id;
    this.displayName = user?.displayName;
    this.username = user.username;
    this.profilePhotoUrl = user?.profilePhotoUrl;
    this.roles = user.roles;
    this.bio = user.bio;
    this.createdAt = user.createdAt;
    this.isVerified = user.isVerified;
    this.isPrivate = user.isPrivate;
    this.email = user.email;
    this.phoneNumber = user.phoneNumber;
    this.dateOfBirth = user.dateOfBirth;
    this.gender = user.gender;
    this.websiteUrl = user?.websiteUrl;
    this.isActive = user.isActive;
    this.emailVerified = user.emailVerified;
    this.followersCount = user.followersCount;
    this.followingsCount = user.followingsCount;
  }
}
