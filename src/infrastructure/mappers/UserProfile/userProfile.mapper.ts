import { User } from 'prisma/generated/prisma/client';
import { IUserProfile } from '../../../core/UserProfile/entities/userProfile.entity';
import { DomainModelMapper } from 'src/infrastructure/types/domainModelMapper.type';

class UserProfileMapper implements DomainModelMapper<IUserProfile, User> {
  toDomain(modelEntity: User): IUserProfile {
    const {
      id,
      name,
      username,
      country,
      profilePhotoUrl,
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
      country,
      profilePhotoUrl,
      roles,
      aboutMe,
      registrationDate,
      isVerified,
      isPrivate,
    };
  }

  toModel(domainEntity: IUserProfile): Partial<User> {
    const {
      id,
      name,
      username,
      country,
      profilePhotoUrl,
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
      country,
      profilePhotoUrl,
      roles,
      aboutMe,
      registrationDate,
      isVerified,
      isPrivate,
    };
  }
}

export default new UserProfileMapper();
