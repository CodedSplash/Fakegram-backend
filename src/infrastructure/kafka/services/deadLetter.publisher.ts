import { Inject, Injectable } from '@nestjs/common';
import { IHeaders, KafkaMessage, Producer } from 'kafkajs';
import { KAFKA_PRODUCER } from '@infrastructure/kafka/services/kafka.service';

export const dlqTopicOf = (topic: string) => `${topic}.dlq`;

export interface DeadLetter {
  topic: string;
  partition: number;
  message: KafkaMessage;
  error: unknown;
  attempts: number;
}

// Сообщение уходит в <topic>.dlq без изменений (ключ, тело, заголовки),
// причина и место падения — в заголовках x-*.
@Injectable()
export class DeadLetterPublisher {
  private connecting?: Promise<void>;

  constructor(@Inject(KAFKA_PRODUCER) private readonly producer: Producer) {}

  async publish(letters: DeadLetter[]): Promise<void> {
    if (letters.length === 0) return;

    await this.ensureConnected();

    const byTopic = new Map<string, DeadLetter[]>();
    for (const letter of letters) {
      const topic = dlqTopicOf(letter.topic);
      byTopic.set(topic, [...(byTopic.get(topic) ?? []), letter]);
    }

    await this.producer.sendBatch({
      acks: -1,
      topicMessages: [...byTopic].map(([topic, items]) => ({
        topic,
        messages: items.map((letter) => ({
          key: letter.message.key,
          value: letter.message.value,
          headers: this.buildHeaders(letter),
        })),
      })),
    });
  }

  private buildHeaders({
    topic,
    partition,
    message,
    error,
    attempts,
  }: DeadLetter): IHeaders {
    return {
      ...message.headers,
      'x-original-topic': topic,
      'x-original-partition': String(partition),
      'x-original-offset': message.offset,
      'x-original-timestamp': message.timestamp,
      'x-error-class': error instanceof Error ? error.name : typeof error,
      'x-error-message': error instanceof Error ? error.message : String(error),
      'x-attempts': String(attempts),
      'x-failed-at': new Date().toISOString(),
    };
  }

  // Consumer может получить сообщения раньше, чем KafkaModule подключит
  // producer в onApplicationBootstrap. Повторный connect в kafkajs безопасен.
  private ensureConnected(): Promise<void> {
    this.connecting ??= this.producer.connect().catch((error: unknown) => {
      this.connecting = undefined;
      throw error;
    });

    return this.connecting;
  }
}
