import { ApiProperty } from '@nestjs/swagger';

export class JwtTokensDto {
  @ApiProperty()
  readonly accessToken: string;

  @ApiProperty()
  readonly refreshToken: string;
}
