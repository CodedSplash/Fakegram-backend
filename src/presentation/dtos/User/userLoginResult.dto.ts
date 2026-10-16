import { ApiProperty } from '@nestjs/swagger';
import { JwtTokensDto } from '@presentation/dtos/Jwt/jwtTokens.dto';
import { UserResponseDto } from '@presentation/dtos/User/userResponse.dto';

export class UserLoginResultDto {
  @ApiProperty()
  readonly user: UserResponseDto;

  @ApiProperty()
  readonly jwt: JwtTokensDto;
}
