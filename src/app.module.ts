import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ErrorHandlerFilter } from '@presentation/filters/ErrorHandler.filter';
import { AuthGuard } from '@presentation/guards/Authentication/auth.guard';
import { throttlerOptions } from '@infrastructure/config/throttler.config';
import { ControllerModule } from '@presentation/controllers/controller.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot(throttlerOptions),
    ControllerModule,
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
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
