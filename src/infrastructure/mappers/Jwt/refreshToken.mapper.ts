import { Token } from '@prisma/client';
import { DomainModelMapper } from '../../../common/types/domainModelMapper.type';
import { IRefreshJwtToken } from '../../../core/Jwt/entities/refreshJwtToken.entity';

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
