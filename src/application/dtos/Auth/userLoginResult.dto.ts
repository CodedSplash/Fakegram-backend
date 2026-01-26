import { ApiProperty } from '@nestjs/swagger';
import { JwtTokensDto } from '@application/dtos/Jwt/jwtTokens.dto';
import { UserResponseDto } from '@application/dtos/Auth/userResponse.dto';

export class UserLoginResultDto {
  @ApiProperty()
  readonly user: UserResponseDto;

  @ApiProperty()
  readonly jwt: JwtTokensDto;
}
