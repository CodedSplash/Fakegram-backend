import { Follow as FollowPrisma } from '@prisma-client/generated/prisma/client';
import { Follow } from '@domain/Follow/entities/follow.entity';
import { DomainModelMapper } from '@infrastructure/types/domainModelMapper.type';

class FollowMapper implements DomainModelMapper<Follow, FollowPrisma> {
  toDomain(modelEntity: FollowPrisma): Follow {
    const { id, followerId, followingId, createdAt } = modelEntity;

    return new Follow({
      id,
      followerId,
      followingId,
      createdAt,
    });
  }
  toModel(domainEntity: Follow): Partial<FollowPrisma> {
    const { id, followerId, followingId, createdAt } = domainEntity;

    return {
      id: id.toString(),
      followerId: followerId.toString(),
      followingId: followingId.toString(),
      createdAt,
    };
  }
}

export default new FollowMapper();
