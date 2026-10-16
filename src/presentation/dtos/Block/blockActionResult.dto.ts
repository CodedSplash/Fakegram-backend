import { ApiProperty } from '@nestjs/swagger';

export class BlockActionResultDto {
  @ApiProperty()
  isSuccess: boolean;

  @ApiProperty()
  message: string;
}
