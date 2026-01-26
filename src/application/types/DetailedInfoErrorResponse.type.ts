import { ApiProperty } from '@nestjs/swagger';
import {
  ErrorResponseInfo,
  ErrorResponseType,
} from '@application/types/errorResponse.type';

class DetailedErrorInfo extends ErrorResponseInfo {
  @ApiProperty()
  readonly message: string;
}

export class DetailedInfoErrorResponseType extends ErrorResponseType {
  @ApiProperty()
  readonly error: DetailedErrorInfo;
}
