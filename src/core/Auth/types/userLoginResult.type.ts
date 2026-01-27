import { IJwtTokens } from '@core/Jwt/types/jwtTokens.interface';
import { IUserAuth } from '@core/Auth/entities/userAuth.entity';

export interface IUserLoginResult {
  jwt: IJwtTokens;
  user: IUserAuth;
}
