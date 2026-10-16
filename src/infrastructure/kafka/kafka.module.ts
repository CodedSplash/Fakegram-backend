import {
  DynamicModule,
  Inject,
  Logger,
  Module,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { KafkaConfig, Producer } from 'kafkajs';
import {
  KAFKA_CONFIG_OPTIONS,
  KAFKA_PRODUCER,
  KafkaFactory,
  KafkaProducerFactory,
} from '@infrastructure/kafka/services/kafka.service';

@Module({})
export class KafkaModule
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(KafkaModule.name);

  constructor(
    @Inject(KAFKA_PRODUCER) private readonly kafkaProducer: Producer,
  ) {}

  static register(data?: {
    options?: KafkaConfig;
    isGlobal?: boolean;
  }): DynamicModule {
    return {
      module: KafkaModule,
      providers: [
        KafkaFactory,
        KafkaProducerFactory,
        {
          provide: KAFKA_CONFIG_OPTIONS,
          useValue: data?.options,
        },
      ],
      exports: [KafkaFactory, KafkaProducerFactory],
      global: data?.isGlobal || false,
    };
  }

  onApplicationBootstrap(): void {
    void this.kafkaProducer
      .connect()
      .catch((error: Error) =>
        this.logger.error(`Kafka producer connection failed: ${error.message}`),
      );
  }

  async onApplicationShutdown(): Promise<void> {
    await this.kafkaProducer.disconnect();
  }
}
