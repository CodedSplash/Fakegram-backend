import { Injectable } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'node:crypto';
import { IRefreshTokenHasher } from '@domain/Jwt/services/refreshTokenHasher.inter';

@Injectable()
export class Sha256RefreshTokenHasher implements IRefreshTokenHasher {
  hash(token: string): string {
    return createHash('sha256').update(token, 'utf8').digest('hex');
  }

  compare(token: string, tokenHash: string): boolean {
    const actual = Buffer.from(this.hash(token), 'hex');
    const expected = Buffer.from(tokenHash, 'hex');

    // timingSafeEqual требует буферы одинаковой длины
    if (actual.length !== expected.length) {
      return false;
    }

    return timingSafeEqual(actual, expected);
  }
}
