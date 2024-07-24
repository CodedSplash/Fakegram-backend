import { Role } from '@prisma/client';
import { GenerateDtoParameterType } from '../../../common/types/dtoParameter.type';

export class GenerateJwtTokenDto {
  readonly id: number;
  readonly username: string;
  readonly roles: Role[];

  constructor(jwt: GenerateDtoParameterType<GenerateJwtTokenDto>) {
    this.roles = jwt.roles;
    this.username = jwt.username;
    this.id = jwt.id;
  }
}
