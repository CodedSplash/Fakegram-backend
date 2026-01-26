import { ApiProperty } from '@nestjs/swagger';
import { GenerateDtoParameterType } from 'src/application/types/dtoParameter.type';

export class HasUserResponseDto {
  @ApiProperty()
  readonly username: string;

  constructor(user: GenerateDtoParameterType<HasUserResponseDto>) {
    this.username = user.username;
  }
}
