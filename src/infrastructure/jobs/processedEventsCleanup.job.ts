import { setTimeout as sleep } from 'node:timers/promises';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@infrastructure/db/services/prisma.service';

const BATCH_SIZE = 5000;
const PAUSE_BETWEEN_BATCHES_MS = 100;
const DAY_MS = 24 * 60 * 60 * 1000;

// Retention должен быть не меньше retention топика follow (7 дней) + запас
// на лаг consumer, иначе повторно доставленное событие не будет отсечено.
@Injectable()
export class ProcessedEventsCleanupJob {
  private readonly logger = new Logger(ProcessedEventsCleanupJob.name);
  private readonly retentionDays: number;
  private isRunning = false;

  constructor(
    private readonly orm: PrismaService,
    configService: ConfigService,
  ) {
    this.retentionDays = Number(
      configService.get<string>('PROCESSED_EVENTS_RETENTION_DAYS', '8'),
    );
  }

  @Cron(CronExpression.EVERY_HOUR, { name: 'processed-events-cleanup' })
  async cleanup(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    const cutoff = new Date(Date.now() - this.retentionDays * DAY_MS);
    let total = 0;

    try {
      // Порциями: без долгих блокировок и всплесков WAL. Параллельный запуск
      // на другом экземпляре безопасен — DELETE идемпотентен.
      while (true) {
        const deleted = await this.orm.$executeRaw`
          DELETE FROM "processed_events"
          WHERE "event_id" IN (
            SELECT "event_id" FROM "processed_events"
            WHERE "processed_at" < ${cutoff}
            LIMIT ${BATCH_SIZE}
          )
        `;
        total += deleted;

        if (deleted < BATCH_SIZE) break;
        await sleep(PAUSE_BETWEEN_BATCHES_MS);
      }

      if (total > 0) {
        this.logger.log(
          `Removed ${total} processed events older than ${cutoff.toISOString()}`,
        );
      }
    } catch (error: unknown) {
      this.logger.error(
        'Processed events cleanup failed',
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.isRunning = false;
    }
  }
}
