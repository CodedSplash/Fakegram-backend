import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ErrorHandlerFilter } from './application/filters/ErrorHandler.filter';
import { UserProfileModule } from './core/UserProfile/userProfile.module';
import { DbModule } from './infrastructure/db/db.module';

@Module({
  imports: [
    DbModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UserProfileModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ErrorHandlerFilter,
    },
  ],
})
export class AppModule {}
