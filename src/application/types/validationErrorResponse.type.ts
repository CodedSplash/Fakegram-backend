import { ApiProperty } from '@nestjs/swagger';
import { ErrorResponseInfo, ErrorResponseType } from './errorResponse.type';

class ValidationErrorInfo extends ErrorResponseInfo {
  @ApiProperty({
    type: [String],
  })
  readonly message: string[];
}

export class ValidationErrorResponseType extends ErrorResponseType {
  @ApiProperty()
  readonly error: ValidationErrorInfo;
}
