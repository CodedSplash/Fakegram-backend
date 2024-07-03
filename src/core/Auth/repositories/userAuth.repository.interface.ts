import { UserRegistrationDto } from '../../../application/dtos/Auth/userRegistration.dto';
import { IUserAuth } from '../entities/userAuth.entity';

export interface IUserAuthRepository {
  createUser(dto: UserRegistrationDto): Promise<IUserAuth>;
}
