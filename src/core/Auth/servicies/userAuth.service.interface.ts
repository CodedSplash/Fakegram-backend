import { UserRegistrationDto } from '../../../application/dtos/Auth/userRegistration.dto';
import { IUserRegistrationResult } from '../types/userRegistrationResult.interface';

export interface IUserAuthService {
  registration(dto: UserRegistrationDto): Promise<IUserRegistrationResult>;
}
