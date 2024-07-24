import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { GenerateDtoParameterType } from '../../../common/types/dtoParameter.type';

export class UserResponseDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty({
    required: false,
  })
  readonly name?: string;

  @ApiProperty()
  readonly username: string;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  readonly country?: string;

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
  readonly aboutMe?: string;

  @ApiProperty({
    required: false,
  })
  readonly registrationDate?: Date;

  @ApiProperty({
    required: false,
  })
  readonly isVerified?: boolean;

  @ApiProperty({
    required: false,
  })
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
