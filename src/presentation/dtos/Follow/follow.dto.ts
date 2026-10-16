import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsCuid } from '@presentation/decorators/isCuid.decorator';
import {
  fieldNotEmptyMessage,
  fieldTypeMessage,
} from '@presentation/utils/validationMessages.util';
import { FollowInputDto } from '@application/Follow/dtos/follow.input.dto';
import { followExample } from '@presentation/swagger/examples/Follow/follow.example';

export class FollowDto implements Pick<FollowInputDto, 'followingId'> {
  @ApiProperty({ example: followExample.followingId })
  @IsNotEmpty({ message: fieldNotEmptyMessage('followingId') })
  @IsString({ message: fieldTypeMessage('followingId', 'строкой') })
  @IsCuid()
  readonly followingId: string;
}
