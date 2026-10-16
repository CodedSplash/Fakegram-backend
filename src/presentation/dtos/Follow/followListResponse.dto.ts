import { ApiProperty } from '@nestjs/swagger';

export class FollowListItemDto {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly username: string;

  @ApiProperty({ type: String, nullable: true })
  readonly displayName: string | null;

  @ApiProperty({ type: String, nullable: true })
  readonly profilePhotoUrl: string | null;

  @ApiProperty()
  readonly isVerified: boolean;

  @ApiProperty()
  readonly followedAt: Date;
}

export class FollowListResponseDto {
  @ApiProperty({ type: [FollowListItemDto] })
  readonly items: FollowListItemDto[];

  @ApiProperty({ type: String, nullable: true })
  readonly nextCursor: string | null;
}
