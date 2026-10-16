import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  Algorithm,
  hash,
  Options,
  parseOptions,
  verify,
} from '@node-rs/argon2';
import { IPasswordHasher } from '@domain/User/services/passwordHasher.inter';

// Параметры argon2id по рекомендации OWASP (m=19 MiB, t=2, p=1)
const ARGON2_OPTIONS: Options = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

// Старый формат: HmacSHA256(password, SECRET_PASSWORD_KEY) в hex
const LEGACY_HASH_REGEX = /^[0-9a-f]{64}$/i;

@Injectable()
export class Argon2PasswordHasher implements IPasswordHasher {
  private dummyHash?: Promise<string>;

  constructor(private readonly configService: ConfigService) {}

  hash(plain: string): Promise<string> {
    return hash(plain, ARGON2_OPTIONS);
  }

  async verify(plain: string, passwordHash: string): Promise<boolean> {
    if (this.isLegacyHash(passwordHash)) {
      // HMAC считается мгновенно: выравниваем время с argon2, чтобы
      // по времени ответа нельзя было отличить legacy-аккаунты
      await this.verifyDummy(plain);
      return this.verifyLegacy(plain, passwordHash);
    }

    try {
      return await verify(passwordHash, plain);
    } catch {
      // Повреждённый или неизвестный формат хеша
      return false;
    }
  }

  needsRehash(passwordHash: string): boolean {
    if (this.isLegacyHash(passwordHash)) {
      return true;
    }

    try {
      const options = parseOptions(passwordHash);

      return (
        options.algorithm !== ARGON2_OPTIONS.algorithm ||
        options.memoryCost !== ARGON2_OPTIONS.memoryCost ||
        options.timeCost !== ARGON2_OPTIONS.timeCost ||
        options.parallelism !== ARGON2_OPTIONS.parallelism
      );
    } catch {
      return true;
    }
  }

  private async verifyDummy(plain: string): Promise<void> {
    this.dummyHash ??= this.hash('fakegram-dummy-password');

    try {
      await verify(await this.dummyHash, plain);
    } catch {
      // результат не важен
    }
  }

  private isLegacyHash(passwordHash: string): boolean {
    return LEGACY_HASH_REGEX.test(passwordHash);
  }

  // Совпадает с crypto-js HmacSHA256(password, key).toString()
  private verifyLegacy(plain: string, passwordHash: string): boolean {
    const actual = createHmac(
      'sha256',
      this.configService.get<string>('SECRET_PASSWORD_KEY'),
    )
      .update(plain, 'utf8')
      .digest();
    const expected = Buffer.from(passwordHash, 'hex');

    // timingSafeEqual требует буферы одинаковой длины
    if (actual.length !== expected.length) {
      return false;
    }

    return timingSafeEqual(actual, expected);
  }
}
