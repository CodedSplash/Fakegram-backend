import { ApiProperty } from '@nestjs/swagger';
import { GenerateDtoParameterType } from '@presentation/types/dtoParameter.type';

export class UserProfileResponseDto {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly username: string;

  @ApiProperty({ type: String, nullable: true })
  readonly displayName: string | null;

  @ApiProperty({ type: String, nullable: true })
  readonly bio: string | null;

  @ApiProperty({ type: String, nullable: true })
  readonly profilePhotoUrl: string | null;

  @ApiProperty({ type: String, nullable: true })
  readonly websiteUrl: string | null;

  @ApiProperty()
  readonly isVerified: boolean;

  @ApiProperty()
  readonly isPrivate: boolean;

  @ApiProperty()
  readonly followersCount: number;

  @ApiProperty()
  readonly followingsCount: number;

  @ApiProperty()
  readonly createdAt: Date;

  // Явный перечень полей: лишнее (email, телефон и т.п.) в ответ не попадёт.
  constructor(profile: GenerateDtoParameterType<UserProfileResponseDto>) {
    this.id = profile.id;
    this.username = profile.username;
    this.displayName = profile.displayName;
    this.bio = profile.bio;
    this.profilePhotoUrl = profile.profilePhotoUrl;
    this.websiteUrl = profile.websiteUrl;
    this.isVerified = profile.isVerified;
    this.isPrivate = profile.isPrivate;
    this.followersCount = profile.followersCount;
    this.followingsCount = profile.followingsCount;
    this.createdAt = profile.createdAt;
  }
}
