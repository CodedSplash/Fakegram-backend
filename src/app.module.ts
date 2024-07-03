import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ErrorHandlerFilter } from './application/filters/ErrorHandler.filter';
import { AuthModule } from './core/Auth/auth.module';
import { JwtModule } from './core/Jwt/jwt.module';
import { UserProfileModule } from './core/UserProfile/userProfile.module';
import { DbModule } from './infrastructure/db/db.module';

@Module({
  imports: [
    DbModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UserProfileModule,
    JwtModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ErrorHandlerFilter,
    },
  ],
})
export class AppModule {}
