import { Module } from '@nestjs/common';
import { RegistrationUseCase } from '@application/Auth/registration.use-case';
import { LoginUseCase } from '@application/Auth/login.use-case';
import { RefreshTokenUseCase } from '@application/Jwt/refreshToken.use-case';
import { HasUserUseCase } from '@application/UserProfile/hasUser.use-case';
import { RepositoryModule } from '@infrastructure/repositories/repository.module';

@Module({
  imports: [RepositoryModule],
  providers: [
    RegistrationUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    HasUserUseCase,
  ],
  exports: [
    RegistrationUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    HasUserUseCase,
  ],
})
export class ApplicationModule {}
