import { ApiProperty } from '@nestjs/swagger';

export class FollowRequestListItemDto {
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
  readonly requestedAt: Date;
}

export class FollowRequestListResponseDto {
  @ApiProperty({ type: [FollowRequestListItemDto] })
  readonly items: FollowRequestListItemDto[];

  @ApiProperty({ type: String, nullable: true })
  readonly nextCursor: string | null;
}
