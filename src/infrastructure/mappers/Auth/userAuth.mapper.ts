import { User } from 'prisma/generated/prisma/client';
import { IUserAuth } from '@domain/Auth/entities/userAuth.entity';
import { DomainModelMapper } from '@infrastructure/types/domainModelMapper.type';

class UserAuthMapper implements DomainModelMapper<IUserAuth, User> {
  toDomain(modelEntity: User): IUserAuth {
    const {
      id,
      name,
      username,
      email,
      password,
      country,
      profilePhotoUrl,
      fullDateBirth,
      roles,
      aboutMe,
      registrationDate,
      isVerified,
      isPrivate,
    } = modelEntity;

    return {
      id,
      name,
      username,
      email,
      password,
      country,
      profilePhotoUrl,
      fullDateBirth,
      roles,
      aboutMe,
      registrationDate,
      isVerified,
      isPrivate,
    };
  }
  toModel(domainEntity: IUserAuth): Partial<User> {
    const {
      id,
      name,
      username,
      email,
      password,
      country,
      profilePhotoUrl,
      fullDateBirth,
      roles,
      aboutMe,
      registrationDate,
      isVerified,
      isPrivate,
    } = domainEntity;

    return {
      id,
      name,
      username,
      email,
      password,
      country,
      profilePhotoUrl,
      fullDateBirth,
      roles,
      aboutMe,
      registrationDate,
      isVerified,
      isPrivate,
    };
  }
}

export default new UserAuthMapper();
