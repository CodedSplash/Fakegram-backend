import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsCuid } from '@presentation/decorators/isCuid.decorator';
import {
  fieldNotEmptyMessage,
  fieldTypeMessage,
} from '@presentation/utils/validationMessages.util';
import { followExample } from '@presentation/swagger/examples/Follow/follow.example';

export class TargetIdParamDto {
  @ApiProperty({ example: followExample.followingId })
  @IsNotEmpty({ message: fieldNotEmptyMessage('targetId') })
  @IsString({ message: fieldTypeMessage('targetId', 'строкой') })
  @IsCuid()
  readonly targetId: string;
}
