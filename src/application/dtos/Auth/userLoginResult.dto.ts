import { ApiProperty } from '@nestjs/swagger';
import { JwtTokensDto } from '../Jwt/jwtTokens.dto';
import { UserResponseDto } from './userResponse.dto';

export class UserLoginResultDto {
  @ApiProperty()
  readonly user: UserResponseDto;

  @ApiProperty()
  readonly jwt: JwtTokensDto;
}
