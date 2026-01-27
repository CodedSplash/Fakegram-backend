import { Module } from '@nestjs/common';
import { RegistrationUseCase } from '@use-cases/Auth/registration.use-case';
import { LoginUseCase } from '@use-cases/Auth/login.use-case';
import { RefreshTokenUseCase } from '@use-cases/Jwt/refreshToken.use-case';
import { HasUserUseCase } from '@use-cases/UserProfile/hasUser.use-case';
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
export class UseCaseModule {}
