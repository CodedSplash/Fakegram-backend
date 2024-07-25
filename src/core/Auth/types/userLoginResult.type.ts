import { IJwtTokens } from '../../Jwt/types/jwtTokens.interface';
import { IUserAuth } from '../entities/userAuth.entity';

export interface IUserLoginResult {
  jwt: IJwtTokens;
  user: IUserAuth;
}
