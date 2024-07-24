import { User } from '@prisma/client';
import { DomainModelMapper } from '../../../common/types/domainModelMapper.type';
import { IUserAuth } from '../../../core/Auth/entities/userAuth.entity';

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
