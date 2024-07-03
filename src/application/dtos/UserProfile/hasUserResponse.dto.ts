import { GenerateDtoParameterType } from '../../../common/types/dtoParameter.type';

export class HasUserResponseDto {
  readonly username: string;

  constructor(user: GenerateDtoParameterType<HasUserResponseDto>) {
    this.username = user.username;
  }
}
