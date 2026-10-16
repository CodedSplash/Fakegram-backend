import { RefreshToken as RefreshTokenPrisma } from '@prisma-client/generated/prisma/client';
import { RefreshToken } from '@domain/Jwt/entities/refreshToken.entity';
import { DomainModelMapper } from '@infrastructure/types/domainModelMapper.type';

class RefreshTokenMapper implements DomainModelMapper<
  RefreshToken,
  RefreshTokenPrisma
> {
  toDomain(modelEntity: RefreshTokenPrisma): RefreshToken {
    const { id, username, tokenHash, createdAt } = modelEntity;

    return new RefreshToken({
      id,
      username,
      tokenHash,
      createdAt,
    });
  }

  toModel(domainEntity: RefreshToken): Partial<RefreshTokenPrisma> {
    const { id, username, tokenHash, createdAt } = domainEntity;

    return {
      id: id.toString(),
      tokenHash: tokenHash.toString(),
      username: username.toString(),
      createdAt,
    };
  }
}

export default new RefreshTokenMapper();
