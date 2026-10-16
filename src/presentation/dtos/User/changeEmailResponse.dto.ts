import { ApiProperty } from '@nestjs/swagger';
import { GenerateDtoParameterType } from '@presentation/types/dtoParameter.type';

export class ChangeEmailResponseDto {
  @ApiProperty()
  readonly email: string;

  @ApiProperty({ description: 'После смены email всегда false' })
  readonly emailVerified: boolean;

  constructor(data: GenerateDtoParameterType<ChangeEmailResponseDto>) {
    this.email = data.email;
    this.emailVerified = data.emailVerified;
  }
}
