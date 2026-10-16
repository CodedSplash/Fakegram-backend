import { UsernameVO } from '@domain/User/value-objects/username.vo';
import { RefreshTokenHashVO } from '@domain/Jwt/value-objects/refreshTokenHash.vo';
import { RefreshTokenIdVO } from '@domain/Jwt/value-objects/refreshTokenId.vo';

export class RefreshToken {
  private readonly _id: RefreshTokenIdVO;
  private readonly _username: UsernameVO;
  private readonly _tokenHash: RefreshTokenHashVO;
  private readonly _createdAt: Date;

  constructor(refreshToken: {
    id: string;
    username: string;
    tokenHash: string;
    createdAt?: Date;
  }) {
    this._id = new RefreshTokenIdVO(refreshToken.id);
    this._username = new UsernameVO(refreshToken.username);
    this._tokenHash = new RefreshTokenHashVO(refreshToken.tokenHash);
    this._createdAt = refreshToken?.createdAt
      ? refreshToken.createdAt
      : new Date();
  }

  get id() {
    return this._id;
  }
  get username() {
    return this._username;
  }
  get tokenHash() {
    return this._tokenHash;
  }
  get createdAt() {
    return this._createdAt;
  }
}
