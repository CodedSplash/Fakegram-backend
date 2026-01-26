import { IJwtTokens } from '@core/Jwt/types/jwtTokens.interface';
import { IUserAuth } from '@core/Auth/entities/userAuth.entity';

export interface IUserRegistrationResult {
  jwt: IJwtTokens;
  user: IUserAuth;
}
