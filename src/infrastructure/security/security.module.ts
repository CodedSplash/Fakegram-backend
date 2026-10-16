import { Module } from '@nestjs/common';
import { REFRESH_TOKEN_HASHER } from '@domain/Jwt/services/refreshTokenHasher.inter';
import { PASSWORD_HASHER } from '@domain/User/services/passwordHasher.inter';
import { Sha256RefreshTokenHasher } from '@infrastructure/security/sha256RefreshTokenHasher.service';
import { Argon2PasswordHasher } from '@infrastructure/security/argon2PasswordHasher.service';

@Module({
  providers: [
    { provide: REFRESH_TOKEN_HASHER, useClass: Sha256RefreshTokenHasher },
    { provide: PASSWORD_HASHER, useClass: Argon2PasswordHasher },
  ],
  exports: [REFRESH_TOKEN_HASHER, PASSWORD_HASHER],
})
export class SecurityModule {}
