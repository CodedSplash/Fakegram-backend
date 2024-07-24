import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseInfo {
  @ApiProperty()
  readonly error: string;
  @ApiProperty()
  readonly statusCode: number;
}

export class ErrorResponseType {
  @ApiProperty()
  readonly status: number;
  @ApiProperty()
  readonly path: string;
  @ApiProperty({
    required: false,
  })
  readonly detailedError?: any;
}
