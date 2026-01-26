import { Role } from 'prisma/generated/prisma/enums';
import { GenerateDtoParameterType } from 'src/application/types/dtoParameter.type';

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
