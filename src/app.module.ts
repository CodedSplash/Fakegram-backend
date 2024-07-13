import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ErrorHandlerFilter } from './application/filters/ErrorHandler.filter';
import { throttlerOptions } from './config/throttler.config';
import { AuthModule } from './core/Auth/auth.module';
import { JwtModule } from './core/Jwt/jwt.module';
import { UserProfileModule } from './core/UserProfile/userProfile.module';
import { DbModule } from './infrastructure/db/db.module';

@Module({
  imports: [
    DbModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot(throttlerOptions),
    UserProfileModule,
    JwtModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ErrorHandlerFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
