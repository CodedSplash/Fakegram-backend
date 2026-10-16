import { ApiProperty } from '@nestjs/swagger';

export class FollowRequestActionResultDto {
  @ApiProperty()
  isSuccess: boolean;

  @ApiProperty()
  message: string;
}
