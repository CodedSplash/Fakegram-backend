import { ApiProperty } from '@nestjs/swagger';

export class BlockListItemDto {
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
  readonly blockedAt: Date;
}

export class BlockListResponseDto {
  @ApiProperty({ type: [BlockListItemDto] })
  readonly items: BlockListItemDto[];

  @ApiProperty({ type: String, nullable: true })
  readonly nextCursor: string | null;
}
