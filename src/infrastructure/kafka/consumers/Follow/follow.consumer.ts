import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { setTimeout as sleep } from 'node:timers/promises';
import { Consumer, EachBatchPayload, Kafka, KafkaMessage } from 'kafkajs';
import { FollowEvent } from '@domain/Follow/events/follow.event.type';
import { isFollowEvent } from '@infrastructure/utils/isFollowEvents.util';
import { isTransientError } from '@infrastructure/utils/isTransientError.util';
import { KAFKA_SERVICE } from '@infrastructure/kafka/services/kafka.service';
import { FollowBatchUseCase } from '@application/Follow/followBatch.use-case';
import {
  DeadLetter,
  DeadLetterPublisher,
} from '@infrastructure/kafka/services/deadLetter.publisher';

const FOLLOW_TOPIC = 'follow';
const CHUNK_SIZE = 1000;
const MAX_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 200;
const MAX_RETRY_DELAY_MS = 5000;
const RESTART_DELAY_MS = 5000;

type Item = { event: FollowEvent; message: KafkaMessage };
type FailedItem = { item: Item; error: unknown; attempts: number };

const parse = (message: KafkaMessage) => {
  try {
    return {
      id: message.headers?.id?.toString(),
      type: message.headers?.eventType?.toString(),
      payload: message.value ? JSON.parse(message.value.toString()) : null,
    };
  } catch {
    return null;
  }
};

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

@Injectable()
export class FollowConsumer implements OnModuleInit, OnModuleDestroy {
  private consumer?: Consumer;
  private isShuttingDown = false;
  private readonly logger = new Logger(FollowConsumer.name);

  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafka: Kafka,
    @Inject(FollowBatchUseCase)
    private readonly followBatchUseCase: FollowBatchUseCase,
    private readonly deadLetterPublisher: DeadLetterPublisher,
  ) {}

  // Запуск в фоне: HTTP не ждёт вступления в группу Kafka и поднимается,
  // даже если Kafka недоступна.
  onModuleInit() {
    void this.startWithRetry();
  }

  async onModuleDestroy() {
    this.isShuttingDown = true;
    await this.consumer?.disconnect();
  }

  private async startWithRetry() {
    while (!this.isShuttingDown) {
      try {
        await this.start();
        return;
      } catch (error: unknown) {
        this.logger.error(
          `Follow consumer start failed, retry in ${RESTART_DELAY_MS} ms: ${errorMessage(error)}`,
        );
        await this.consumer?.disconnect().catch(() => undefined);
        await sleep(RESTART_DELAY_MS);
      }
    }
  }

  private async start() {
    const consumer = this.kafka.consumer({ groupId: 'follow-counters' });
    this.consumer = consumer;

    // kafkajs сам не перезапускает consumer после ошибок не из kafkajs
    // (TypeError, ошибки Prisma) — без этого он молча останавливается.
    consumer.on(consumer.events.CRASH, ({ payload }) => {
      if (payload.restart || this.isShuttingDown) return;
      if (this.consumer !== consumer) return;

      this.logger.error(
        `Follow consumer crashed, restart in ${RESTART_DELAY_MS} ms: ${errorMessage(payload.error)}`,
      );
      void this.restartAfterCrash(consumer);
    });

    await consumer.connect();
    // fromBeginning действует только для группы без сохранённого offset: иначе
    // события, записанные до первого коммита группы, были бы пропущены.
    await consumer.subscribe({ topic: FOLLOW_TOPIC, fromBeginning: true });
    await consumer.run({
      autoCommit: false,
      eachBatchAutoResolve: false,
      eachBatch: (payload) => this.handleBatch(consumer, payload),
    });
  }

  private async restartAfterCrash(crashed: Consumer) {
    await crashed.disconnect().catch(() => undefined);
    await sleep(RESTART_DELAY_MS);
    await this.startWithRetry();
  }

  private async handleBatch(
    consumer: Consumer,
    { batch, resolveOffset, heartbeat, isRunning, isStale }: EachBatchPayload,
  ) {
    const { topic, partition, messages } = batch;
    const items: Item[] = [];
    const deadLetters: DeadLetter[] = [];

    for (const message of messages) {
      const event = parse(message);
      if (isFollowEvent(event)) {
        items.push({ event, message });
      } else {
        this.logger.warn(`Invalid follow event, offset: ${message.offset}`);
        deadLetters.push({
          topic,
          partition,
          message,
          error: new Error('Invalid follow event'),
          attempts: 0,
        });
      }
    }

    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      // Партицию забрали при ребалансе — offset не коммитим, пачку
      // дообработает новый владелец (дубли отсечёт processed_events).
      if (!isRunning() || isStale()) return;

      const failed = await this.process(
        items.slice(i, i + CHUNK_SIZE),
        heartbeat,
      );
      deadLetters.push(
        ...failed.map(({ item, error, attempts }) => ({
          topic,
          partition,
          message: item.message,
          error,
          attempts,
        })),
      );
      await heartbeat();
    }

    // Сначала DLQ, потом offset: если отправка в DLQ упала, пачка придёт снова.
    if (deadLetters.length > 0) {
      await this.deadLetterPublisher.publish(deadLetters);
      this.logger.error(
        `${deadLetters.length} follow event(s) sent to DLQ, offsets: ${deadLetters
          .map(({ message }) => message.offset)
          .join(', ')}`,
      );
    }

    // lastOffset — метод Batch, вызывать только на самом объекте.
    // При autoCommit: false commitOffsetsIfNecessary ничего не коммитит,
    // поэтому коммит явный: offset следующего сообщения после пачки.
    const lastOffset = batch.lastOffset();
    resolveOffset(lastOffset);
    await consumer.commitOffsets([
      { topic, partition, offset: (BigInt(lastOffset) + 1n).toString() },
    ]);
  }

  // Временная ошибка (БД недоступна) пробрасывается: offset не коммитится,
  // kafkajs перезапустит consumer, и в DLQ не уедет весь поток.
  // Постоянная — пачка делится пополам, пока не останется виновное событие.
  private async process(
    items: Item[],
    heartbeat: () => Promise<void>,
  ): Promise<FailedItem[]> {
    try {
      await this.executeWithRetry(items, heartbeat);
      return [];
    } catch (error: unknown) {
      if (isTransientError(error)) throw error;

      if (items.length === 1) {
        return [{ item: items[0], error, attempts: MAX_ATTEMPTS }];
      }

      const middle = Math.ceil(items.length / 2);
      return [
        ...(await this.process(items.slice(0, middle), heartbeat)),
        ...(await this.process(items.slice(middle), heartbeat)),
      ];
    }
  }

  // Пачку повторяем только при временной ошибке. Одиночное событие —
  // при любой: перед отправкой в DLQ стоит убедиться, что это не случайный сбой.
  private async executeWithRetry(
    items: Item[],
    heartbeat: () => Promise<void>,
  ): Promise<void> {
    const events = items.map(({ event }) => event);
    const retryAnyError = items.length === 1;

    for (let attempt = 1; ; attempt++) {
      try {
        await this.followBatchUseCase.execute(events);
        return;
      } catch (error: unknown) {
        const retryable = retryAnyError || isTransientError(error);
        if (!retryable || attempt >= MAX_ATTEMPTS) throw error;

        this.logger.warn(
          `Follow batch of ${events.length} failed (attempt ${attempt}/${MAX_ATTEMPTS}): ${errorMessage(error)}`,
        );

        const delay = Math.min(
          BASE_RETRY_DELAY_MS * 2 ** (attempt - 1),
          MAX_RETRY_DELAY_MS,
        );
        await sleep(delay + Math.floor(Math.random() * BASE_RETRY_DELAY_MS));
        await heartbeat();
      }
    }
  }
}
