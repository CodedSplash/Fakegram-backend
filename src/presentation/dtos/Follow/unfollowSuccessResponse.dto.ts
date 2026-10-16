import { ApiProperty } from '@nestjs/swagger';

export class UnfollowSuccessResponseDto {
  @ApiProperty()
  isSuccess: boolean;

  @ApiProperty()
  message: string;
}
