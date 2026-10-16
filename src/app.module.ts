import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ErrorHandlerFilter } from '@presentation/filters/ErrorHandler.filter';
import { AuthGuard } from '@presentation/guards/Authentication/auth.guard';
import { throttlerOptions } from '@infrastructure/config/throttler.config';
import { ControllerModule } from '@presentation/controllers/controller.module';
import { ConsumerModule } from '@infrastructure/kafka/consumers/consumer.module';
import { JobsModule } from '@infrastructure/jobs/jobs.module';
import { ApplicationModule } from '@application/application.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot(throttlerOptions),
    // AuthGuard (APP_GUARD ниже) использует ValidateAccessTokenUseCase
    ApplicationModule,
    ControllerModule,
    ConsumerModule,
    JobsModule,
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
