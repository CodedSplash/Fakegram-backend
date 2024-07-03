import { GenerateDtoParameterType } from '../../../common/types/dtoParameter.type';

export class UserRegistrationDto {
  readonly name?: string;
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly fullDateBirth: Date;

  constructor(user: GenerateDtoParameterType<UserRegistrationDto>) {
    this.name = user.name;
    this.username = user.username;
    this.email = user.email;
    this.password = user.password;
    this.fullDateBirth = user.fullDateBirth;
  }
}
