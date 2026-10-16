// CLI переотправки сообщений из DLQ в исходный топик. Запускается отдельно
// от приложения (не импортируется модулями Nest):
//   node dist/src/infrastructure/kafka/scripts/replayDlq.js --help
import 'dotenv/config';
import {
  Consumer,
  EachBatchPayload,
  IHeaders,
  Kafka,
  KafkaMessage,
  logLevel,
  Partitioners,
  Producer,
} from 'kafkajs';

const USAGE = `Usage: node dist/src/infrastructure/kafka/scripts/replayDlq.js [options]

Re-publishes messages from a DLQ topic to the original topic.
By default runs in dry-run mode: prints messages, sends and commits nothing.

Options:
  --topic <name>                    DLQ topic (default: follow.dlq)
  --execute                         actually send messages and commit DLQ offsets
  --dry-run                         only print messages (default)
  --limit <n>                       stop after <n> matching messages
  --from-offset <o|p:o[,p:o...]>    start offset for all partitions or per partition
                                    (default: group's committed offset, else beginning)
  --filter-error <substring>        replay only messages whose x-error-message contains it
  --older-than-warning-days <n>     warn about messages older than <n> days (default: 8)
  --group <id>                      consumer group (default: follow-dlq-replay)
  --idle-timeout-ms <n>             fail if no progress for <n> ms (default: 30000)
  -h, --help                        show this help

Env: KAFKA_BROKERS (default localhost:9094), KAFKA_CLIENT_ID.`;

const DIAGNOSTIC_HEADERS = new Set([
  'x-original-topic',
  'x-original-partition',
  'x-original-offset',
  'x-original-timestamp',
  'x-error-class',
  'x-error-message',
  'x-attempts',
  'x-failed-at',
  'x-replayed-at',
  'x-replay-count',
]);

const DAY_MS = 24 * 60 * 60 * 1000;

interface Options {
  topic: string;
  execute: boolean;
  limit?: number;
  fromOffset?: { all?: string; partitions: Map<number, string> };
  filterError?: string;
  warningDays: number;
  group: string;
  idleTimeoutMs: number;
}

interface Counters {
  seen: number;
  replayed: number;
  skipped: number;
  warnings: number;
}

class UsageError extends Error {}

const parseNumber = (name: string, raw: string | undefined, min = 0) => {
  const value = Number(raw);
  if (raw === undefined || !Number.isInteger(value) || value < min) {
    throw new UsageError(`${name} expects an integer >= ${min}`);
  }
  return value;
};

const parseFromOffset = (raw: string | undefined) => {
  if (!raw) throw new UsageError('--from-offset expects a value');

  if (/^\d+$/.test(raw)) return { all: raw, partitions: new Map() };

  const partitions = new Map<number, string>();
  for (const part of raw.split(',')) {
    const match = /^(\d+):(\d+)$/.exec(part.trim());
    if (!match) throw new UsageError(`Invalid --from-offset entry: ${part}`);
    partitions.set(Number(match[1]), match[2]);
  }
  return { partitions };
};

const parseArgs = (argv: string[]): Options | null => {
  const options: Options = {
    topic: 'follow.dlq',
    execute: false,
    warningDays: 8,
    group: 'follow-dlq-replay',
    idleTimeoutMs: 30000,
  };
  let dryRunFlag = false;

  for (let i = 0; i < argv.length; i++) {
    const [flag, inline] = argv[i].split(/=(.*)/s, 2);
    const value = () => (inline !== undefined ? inline : argv[++i]);

    switch (flag) {
      case '-h':
      case '--help':
        return null;
      case '--topic':
        options.topic = value();
        if (!options.topic) throw new UsageError('--topic expects a value');
        break;
      case '--execute':
        options.execute = true;
        break;
      case '--dry-run':
        dryRunFlag = true;
        break;
      case '--limit':
        options.limit = parseNumber(flag, value(), 1);
        break;
      case '--from-offset':
        options.fromOffset = parseFromOffset(value());
        break;
      case '--filter-error':
        options.filterError = value();
        if (!options.filterError) {
          throw new UsageError('--filter-error expects a value');
        }
        break;
      case '--older-than-warning-days':
        options.warningDays = parseNumber(flag, value());
        break;
      case '--group':
        options.group = value();
        if (!options.group) throw new UsageError('--group expects a value');
        break;
      case '--idle-timeout-ms':
        options.idleTimeoutMs = parseNumber(flag, value(), 1);
        break;
      default:
        throw new UsageError(`Unknown option: ${argv[i]}`);
    }
  }

  if (dryRunFlag && options.execute) {
    throw new UsageError('--dry-run and --execute are mutually exclusive');
  }
  return options;
};

// Та же конфигурация, что в kafka.service.ts, но без ConfigService.
const createKafka = () =>
  new Kafka({
    clientId: `${process.env.KAFKA_CLIENT_ID || 'fakegram-backend'}-dlq-replay`,
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9094')
      .split(',')
      .map((broker) => broker.trim())
      .filter(Boolean),
    connectionTimeout: 3000,
    retry: { initialRetryTime: 300, retries: 10 },
    logLevel: logLevel.WARN,
  });

const header = (headers: IHeaders | undefined, name: string) => {
  const value = headers?.[name];
  const first = Array.isArray(value) ? value[0] : value;
  return first?.toString();
};

const targetTopicOf = (dlqTopic: string, message: KafkaMessage) =>
  header(message.headers, 'x-original-topic') || dlqTopic.replace(/\.dlq$/, '');

const replayHeaders = (headers: IHeaders | undefined): IHeaders => {
  const result: IHeaders = {};
  for (const [name, value] of Object.entries(headers ?? {})) {
    if (!DIAGNOSTIC_HEADERS.has(name) && value !== undefined) {
      result[name] = value;
    }
  }

  const count = Number(header(headers, 'x-replay-count'));
  result['x-replayed-at'] = new Date().toISOString();
  result['x-replay-count'] = String(Number.isFinite(count) ? count + 1 : 1);
  return result;
};

const formatAge = (ms: number) => {
  if (!Number.isFinite(ms)) return 'unknown';
  const hours = ms / (60 * 60 * 1000);
  return hours >= 24 ? `${(hours / 24).toFixed(1)}d` : `${hours.toFixed(1)}h`;
};

class DlqReplay {
  private readonly kafka = createKafka();
  private readonly counters: Counters = {
    seen: 0,
    replayed: 0,
    skipped: 0,
    warnings: 0,
  };
  // Следующий offset, до которого читаем (high watermark на момент старта).
  private readonly targets = new Map<number, bigint>();
  private readonly pending = new Set<number>();
  // Партиции, в которых встретилось отфильтрованное сообщение: дальше
  // offset не коммитим, чтобы не потерять его для следующих запусков.
  private readonly commitBlocked = new Set<number>();
  private consumer?: Consumer;
  private producer?: Producer;
  private matched = 0;
  private failure?: unknown;
  private interrupted = false;
  private finish!: () => void;
  private readonly finished = new Promise<void>((resolve) => {
    this.finish = resolve;
  });
  private idleTimer?: NodeJS.Timeout;

  constructor(private readonly options: Options) {}

  get stats() {
    return this.counters;
  }

  interrupt() {
    this.interrupted = true;
    this.stop();
  }

  async run(): Promise<number> {
    const { topic, execute, group } = this.options;
    console.log(
      `[dlq-replay] topic=${topic} group=${group} mode=${execute ? 'EXECUTE' : 'DRY-RUN'}`,
    );

    try {
      const starts = await this.prepare();
      if (this.pending.size === 0) {
        console.log('[dlq-replay] nothing to replay: DLQ is caught up');
        return 0;
      }

      if (execute) {
        this.producer = this.kafka.producer({
          allowAutoTopicCreation: false,
          createPartitioner: Partitioners.DefaultPartitioner,
        });
        await this.producer.connect();
      }

      this.consumer = this.kafka.consumer({ groupId: group });
      this.consumer.on(this.consumer.events.CRASH, ({ payload }) => {
        if (!payload.restart) this.fail(payload.error);
      });
      await this.consumer.connect();
      await this.consumer.subscribe({ topic, fromBeginning: true });
      await this.consumer.run({
        autoCommit: false,
        eachBatchAutoResolve: false,
        eachBatch: (payload) => this.handleBatch(payload),
      });
      for (const [partition, offset] of starts) {
        this.consumer.seek({ topic, partition, offset });
      }

      this.touch();
      await this.finished;
    } catch (error: unknown) {
      this.fail(error);
    } finally {
      clearTimeout(this.idleTimer);
      await this.consumer?.disconnect().catch(() => undefined);
      await this.producer?.disconnect().catch(() => undefined);
    }

    if (this.failure) {
      const error = this.failure;
      console.error(
        `[dlq-replay] failed: ${error instanceof Error ? error.stack : String(error)}`,
      );
      return 1;
    }
    return this.interrupted ? 130 : 0;
  }

  // Считает границы чтения: стартовый offset группы и high watermark.
  // Возвращает явные seek-и для --from-offset.
  private async prepare(): Promise<Map<number, string>> {
    const { topic, group, fromOffset } = this.options;
    const admin = this.kafka.admin();
    await admin.connect();
    try {
      const watermarks = await admin.fetchTopicOffsets(topic);
      const [committed] = await admin.fetchOffsets({
        groupId: group,
        topics: [topic],
      });
      const committedBy = new Map(
        (committed?.partitions ?? []).map((p) => [p.partition, p.offset]),
      );

      const seeks = new Map<number, string>();
      for (const { partition, low, high } of watermarks) {
        const explicit =
          fromOffset?.partitions.get(partition) ?? fromOffset?.all;
        if (explicit !== undefined) seeks.set(partition, explicit);

        const groupOffset = committedBy.get(partition);
        let start =
          explicit ?? (groupOffset && groupOffset !== '-1' ? groupOffset : low);
        if (BigInt(start) < BigInt(low)) start = low;

        this.targets.set(partition, BigInt(high));
        if (BigInt(start) < BigInt(high)) this.pending.add(partition);

        console.log(
          `[dlq-replay] partition ${partition}: start=${start} high=${high} (${
            BigInt(high) - BigInt(start) > 0n
              ? BigInt(high) - BigInt(start)
              : 0n
          } to read)`,
        );
      }

      for (const partition of fromOffset?.partitions.keys() ?? []) {
        if (!this.targets.has(partition)) {
          throw new UsageError(`Partition ${partition} does not exist`);
        }
      }
      return seeks;
    } finally {
      await admin.disconnect();
    }
  }

  private async handleBatch({
    batch: { topic, partition, messages },
    heartbeat,
    isRunning,
    isStale,
  }: EachBatchPayload) {
    const target = this.targets.get(partition);

    for (const message of messages) {
      if (this.isStopping() || !isRunning() || isStale()) return;
      if (target === undefined || BigInt(message.offset) >= target) {
        this.markDone(partition);
        return;
      }

      try {
        await this.handleMessage(topic, partition, message);
      } catch (error: unknown) {
        this.fail(error);
        return;
      }

      this.touch();
      if (BigInt(message.offset) + 1n >= target) this.markDone(partition);
      if (
        this.options.limit !== undefined &&
        this.matched >= this.options.limit
      ) {
        console.log(`[dlq-replay] limit ${this.options.limit} reached`);
        this.stop();
        return;
      }
      await heartbeat();
    }
  }

  private async handleMessage(
    topic: string,
    partition: number,
    message: KafkaMessage,
  ) {
    const { execute, filterError, warningDays } = this.options;
    this.counters.seen++;

    const errorMessage = header(message.headers, 'x-error-message') ?? '';
    const originalTimestamp = Number(
      header(message.headers, 'x-original-timestamp') ?? message.timestamp,
    );
    const age = Date.now() - originalTimestamp;
    const target = targetTopicOf(topic, message);
    const summary =
      `p=${partition} offset=${message.offset} key=${message.key?.toString() ?? '<null>'} ` +
      `eventType=${header(message.headers, 'eventType') ?? '?'} -> ${target} ` +
      `age=${formatAge(age)} error="${errorMessage}"`;

    if (filterError && !errorMessage.includes(filterError)) {
      this.counters.skipped++;
      if (execute) this.commitBlocked.add(partition);
      console.log(`[dlq-replay] SKIP ${summary}`);
      return;
    }
    this.matched++;

    if (Number.isFinite(age) && age > warningDays * DAY_MS) {
      this.counters.warnings++;
      console.warn(
        `[dlq-replay] WARN p=${partition} offset=${message.offset}: original event is older than ` +
          `${warningDays} days, processed_events no longer deduplicates it`,
      );
    }

    if (!execute) {
      console.log(`[dlq-replay] DRY ${summary}`);
      return;
    }

    if (target === topic) {
      throw new Error(`Refusing to replay ${topic} into itself`);
    }

    await this.producer!.send({
      topic: target,
      acks: -1,
      messages: [
        {
          key: message.key,
          value: message.value,
          headers: replayHeaders(message.headers),
        },
      ],
    });
    this.counters.replayed++;
    console.log(`[dlq-replay] SENT ${summary}`);

    if (!this.commitBlocked.has(partition)) {
      await this.consumer!.commitOffsets([
        {
          topic,
          partition,
          offset: (BigInt(message.offset) + 1n).toString(),
        },
      ]);
    }
  }

  private markDone(partition: number) {
    this.pending.delete(partition);
    if (this.pending.size === 0) this.stop();
  }

  private isStopping() {
    return (
      this.failure !== undefined ||
      this.interrupted ||
      this.pending.size === 0 ||
      (this.options.limit !== undefined && this.matched >= this.options.limit)
    );
  }

  // Партиция могла уйти другому участнику группы — не ждём бесконечно.
  private touch() {
    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      this.fail(
        new Error(
          `No progress for ${this.options.idleTimeoutMs} ms, pending partitions: ${[
            ...this.pending,
          ].join(', ')}`,
        ),
      );
    }, this.options.idleTimeoutMs);
  }

  private fail(error: unknown) {
    this.failure ??= error;
    this.stop();
  }

  private stop() {
    clearTimeout(this.idleTimer);
    this.finish();
  }
}

const main = async () => {
  let options: Options | null;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : String(error));
    console.error(USAGE);
    return 2;
  }

  if (!options) {
    console.log(USAGE);
    return 0;
  }

  const replay = new DlqReplay(options);
  const onSignal = () => {
    console.log('[dlq-replay] interrupted, shutting down...');
    replay.interrupt();
  };
  process.once('SIGINT', onSignal);
  process.once('SIGTERM', onSignal);

  const code = await replay.run();
  const { seen, replayed, skipped, warnings } = replay.stats;
  console.log(
    `[dlq-replay] done: seen=${seen} replayed=${replayed} skipped=${skipped} warnings=${warnings}` +
      (options.execute ? '' : ' (dry-run, nothing sent or committed)'),
  );
  if (options.execute && skipped > 0) {
    console.log(
      '[dlq-replay] note: offsets are not committed past skipped messages; ' +
        'replayed messages after them may be sent again on the next run',
    );
  }
  return code;
};

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
