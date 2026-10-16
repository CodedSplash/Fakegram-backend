import { ValidationError } from '@domain/common/errors/domain.error';

// В БД хранится только SHA-256 хеш refresh токена (64 hex символа)
const REFRESH_TOKEN_HASH_REGEX = /^[a-f0-9]{64}$/;

export class RefreshTokenHashVO {
  constructor(readonly value: string) {
    this.validation(value);
  }

  private validation(tokenHash: string) {
    if (!tokenHash || tokenHash.trim().length === 0) {
      throw new ValidationError('Refresh token hash cannot be empty.');
    }

    if (!REFRESH_TOKEN_HASH_REGEX.test(tokenHash)) {
      throw new ValidationError(
        'Refresh token hash must be a 64-character hex SHA-256 digest.',
      );
    }
  }

  equal(tokenHash: RefreshTokenHashVO): boolean {
    return tokenHash.value === this.value;
  }

  toString(): string {
    return this.value;
  }
}
