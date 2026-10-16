import { IJwtTokens } from '@domain/Jwt/types/jwtTokens.interface';
import { User } from '@domain/User/entities/user.entity';

export interface IUserLoginResult {
  jwt: IJwtTokens;
  user: User;
}
