import { UserRegistrationDto } from '@presentation/dtos/Auth/userRegistration.dto';
import { IUserAuth } from '@domain/Auth/entities/userAuth.entity';

export interface IUserAuthRepository {
  createUser(dto: UserRegistrationDto): Promise<IUserAuth>;

  getUser(username: string): Promise<IUserAuth | null>;
}
