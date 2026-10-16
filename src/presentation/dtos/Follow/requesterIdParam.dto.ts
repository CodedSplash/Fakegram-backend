import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsCuid } from '@presentation/decorators/isCuid.decorator';
import {
  fieldNotEmptyMessage,
  fieldTypeMessage,
} from '@presentation/utils/validationMessages.util';
import { followExample } from '@presentation/swagger/examples/Follow/follow.example';

export class RequesterIdParamDto {
  @ApiProperty({ example: followExample.followerId })
  @IsNotEmpty({ message: fieldNotEmptyMessage('requesterId') })
  @IsString({ message: fieldTypeMessage('requesterId', 'строкой') })
  @IsCuid()
  readonly requesterId: string;
}
