import { GenerateDtoParameterType } from '../../../common/types/dtoParameter.type';

export class RefreshTokenResponseDto {
  readonly accessToken: string;
  readonly refreshToken: string;

  constructor(tokens: GenerateDtoParameterType<RefreshTokenResponseDto>) {
    this.refreshToken = tokens.refreshToken;
    this.accessToken = tokens.accessToken;
  }
}
