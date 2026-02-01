import { ApiProperty } from '@nestjs/swagger';
import { ErrorResponseType } from '@presentation/types/errorResponse.type';

export class DefaultErrorResponseType extends ErrorResponseType {
  @ApiProperty()
  readonly error: string;
}
