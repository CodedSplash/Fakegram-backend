import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DbModule } from '@infrastructure/db/db.module';
import { ProcessedEventsCleanupJob } from '@infrastructure/jobs/processedEventsCleanup.job';

@Module({
  imports: [ScheduleModule.forRoot(), DbModule],
  providers: [ProcessedEventsCleanupJob],
})
export class JobsModule {}
