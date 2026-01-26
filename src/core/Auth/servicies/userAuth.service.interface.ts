import { UserLoginDto } from '@application/dtos/Auth/userLogin.dto';
import { UserRegistrationDto } from '@application/dtos/Auth/userRegistration.dto';
import { IUserLoginResult } from '@core/Auth/types/userLoginResult.type';
import { IUserRegistrationResult } from '@core/Auth/types/userRegistrationResult.interface';

export interface IUserAuthService {
  registration(dto: UserRegistrationDto): Promise<IUserRegistrationResult>;

  login(dto: UserLoginDto): Promise<IUserLoginResult>;
}
