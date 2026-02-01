import { IJwtTokens } from '@domain/Jwt/types/jwtTokens.interface';
import { IUserAuth } from '@domain/Auth/entities/userAuth.entity';

export interface IUserLoginResult {
  jwt: IJwtTokens;
  user: IUserAuth;
}
