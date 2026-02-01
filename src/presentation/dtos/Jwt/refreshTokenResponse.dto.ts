import { ApiProperty } from '@nestjs/swagger';
import { GenerateDtoParameterType } from '@presentation/types/dtoParameter.type';

export class RefreshTokenResponseDto {
  @ApiProperty()
  readonly accessToken: string;

  @ApiProperty()
  readonly refreshToken: string;

  constructor(tokens: GenerateDtoParameterType<RefreshTokenResponseDto>) {
    this.refreshToken = tokens.refreshToken;
    this.accessToken = tokens.accessToken;
  }
}
