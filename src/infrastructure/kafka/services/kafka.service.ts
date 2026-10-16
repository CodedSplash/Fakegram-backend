import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, KafkaConfig, logLevel, Partitioners, Producer } from 'kafkajs';

export const KAFKA_SERVICE = Symbol('KAFKA_SERVICE');
export const KAFKA_PRODUCER = Symbol('KAFKA_PRODUCER');
export const KAFKA_CONFIG_OPTIONS = Symbol('KAFKA_CONFIG_OPTIONS');

const buildKafkaConfig = (configService: ConfigService): KafkaConfig => ({
  clientId: configService.get<string>('KAFKA_CLIENT_ID', 'fakegram-backend'),
  brokers: configService
    .get<string>('KAFKA_BROKERS', 'localhost:9094')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean),
  connectionTimeout: 3000,
  retry: { initialRetryTime: 300, retries: 10 },
  logLevel: logLevel.WARN,
});

export const KafkaFactory: FactoryProvider = {
  provide: KAFKA_SERVICE,
  useFactory: (configService: ConfigService, options?: KafkaConfig) => {
    return new Kafka({ ...buildKafkaConfig(configService), ...options });
  },
  inject: [ConfigService, { token: KAFKA_CONFIG_OPTIONS, optional: true }],
};

export const KafkaProducerFactory: FactoryProvider = {
  provide: KAFKA_PRODUCER,
  useFactory: (kafkaService: Kafka): Producer => {
    return kafkaService.producer({
      allowAutoTopicCreation: false,
      createPartitioner: Partitioners.DefaultPartitioner,
    });
  },
  inject: [KAFKA_SERVICE],
};
