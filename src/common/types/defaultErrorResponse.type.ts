import { ApiProperty } from '@nestjs/swagger';
import { ErrorResponseInfo, ErrorResponseType } from './errorResponse.type';

class DefaultErrorInfo extends ErrorResponseInfo {
  @ApiProperty()
  readonly message: string;
}

export class DefaultErrorResponseType extends ErrorResponseType {
  @ApiProperty()
  readonly error: DefaultErrorInfo;
}
