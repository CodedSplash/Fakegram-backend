import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  DEFAULT_FOLLOW_LIST_LIMIT,
  MAX_CURSOR_LENGTH,
  MAX_FOLLOW_LIST_LIMIT,
} from '@presentation/constants/validation.constants';
import {
  fieldTypeMessage,
  generateMaxLengthMessage,
  generateMaxValueMessage,
  generateMinValueMessage,
} from '@presentation/utils/validationMessages.util';
import { followListResponseExample } from '@presentation/swagger/examples/Follow/followList.example';

export class FollowListQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
    maximum: MAX_FOLLOW_LIST_LIMIT,
    default: DEFAULT_FOLLOW_LIST_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: fieldTypeMessage('limit', 'целым числом') })
  @Min(1, { message: generateMinValueMessage('limit', 1) })
  @Max(MAX_FOLLOW_LIST_LIMIT, {
    message: generateMaxValueMessage('limit', MAX_FOLLOW_LIST_LIMIT),
  })
  readonly limit?: number;

  @ApiPropertyOptional({
    description: 'nextCursor из предыдущей страницы',
    example: followListResponseExample.nextCursor,
  })
  @IsOptional()
  @IsString({ message: fieldTypeMessage('cursor', 'строкой') })
  @MaxLength(MAX_CURSOR_LENGTH, {
    message: generateMaxLengthMessage('cursor', MAX_CURSOR_LENGTH),
  })
  readonly cursor?: string;
}
