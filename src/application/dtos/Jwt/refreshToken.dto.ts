import { GenerateDtoParameterType } from '../../../common/types/dtoParameter.type';

export class RefreshTokenDto {
  readonly username: string;
  readonly refreshToken: string;

  constructor(jwt: GenerateDtoParameterType<RefreshTokenDto>) {
    this.username = jwt.username;
    this.refreshToken = jwt.refreshToken;
  }
}
