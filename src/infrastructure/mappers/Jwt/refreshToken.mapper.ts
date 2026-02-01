import { Token } from 'prisma/generated/prisma/client';
import { IRefreshJwtToken } from '@domain/Jwt/entities/refreshJwtToken.entity';
import { DomainModelMapper } from '@infrastructure/types/domainModelMapper.type';

class RefreshTokenMapper implements DomainModelMapper<IRefreshJwtToken, Token> {
  toDomain(modelEntity: Token): IRefreshJwtToken {
    const { id, username, token } = modelEntity;

    return {
      id,
      token,
      username,
    };
  }

  toModel(domainEntity: IRefreshJwtToken): Partial<Token> {
    const { id, username, token } = domainEntity;

    return {
      id,
      token,
      username,
    };
  }
}

export default new RefreshTokenMapper();
