import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma-client/generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(private readonly configService: ConfigService) {
    const logger = new Logger(PrismaService.name);
    const adapter = new PrismaPg(
      {
        connectionString: configService.get<string>('DATABASE_URL'),
        max: Number(configService.get<string>('DATABASE_POOL_MAX', '10')),
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 5_000,
      },
      {
        onPoolError: (error) => logger.error(`Pool error: ${error.message}`),
        onConnectionError: (error) =>
          logger.error(`Connection error: ${error.message}`),
      },
    );

    super({ adapter });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
