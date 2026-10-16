import { Prisma } from '@prisma-client/generated/prisma/client';

// Ошибки, после которых операцию имеет смысл повторить: БД недоступна,
// таймаут, обрыв соединения, deadlock, исчерпан пул и т.п.
const TRANSIENT_PRISMA_CODES = new Set([
  'P1001', // DatabaseNotReachable
  'P1002', // Database server timed out
  'P1008', // SocketTimeout
  'P1017', // ConnectionClosed
  'P1018', // TransactionAlreadyClosed
  'P2024', // Connection pool timeout
  'P2028', // Transaction API error (таймаут интерактивной транзакции)
  'P2034', // TransactionWriteConflict (deadlock / serialization)
  'P2037', // TooManyConnections
]);

const TRANSIENT_ADAPTER_KINDS = new Set([
  'DatabaseNotReachable',
  'ConnectionClosed',
  'SocketTimeout',
  'TooManyConnections',
  'TransactionWriteConflict',
  'TransactionAlreadyClosed',
]);

const TRANSIENT_NODE_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'EPIPE',
  'ENOTFOUND',
  'EAI_AGAIN',
]);

// SQLSTATE: 08 — connection exception, 53 — insufficient resources,
// 57P0x — сервер останавливается/перезапускается, 40001/40P01 — serialization/deadlock.
const isTransientSqlState = (code: string) =>
  code.startsWith('08') ||
  code.startsWith('53') ||
  ['40001', '40P01', '55P03', '57P01', '57P02', '57P03'].includes(code);

// pg и pg-pool бросают ошибки соединения без кода, а драйвер-адаптер Prisma
// пробрасывает их как есть — узнаём по тексту.
const TRANSIENT_PG_MESSAGES = [
  'Connection terminated',
  'timeout exceeded when trying to connect',
  'Client has encountered a connection error',
  'Query read timeout',
  'timeout expired',
];

const MAX_DEPTH = 5;

export const isTransientError = (error: unknown): boolean => {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  let current: unknown = error;

  for (let depth = 0; current && depth < MAX_DEPTH; depth++) {
    if (typeof current !== 'object') return false;

    const { code, kind, originalCode, message, meta, cause } = current as {
      code?: unknown;
      message?: unknown;
      kind?: unknown;
      originalCode?: unknown;
      meta?: { driverAdapterError?: unknown };
      cause?: unknown;
    };

    if (
      typeof code === 'string' &&
      (TRANSIENT_PRISMA_CODES.has(code) ||
        TRANSIENT_NODE_CODES.has(code) ||
        isTransientSqlState(code))
    ) {
      return true;
    }
    if (typeof kind === 'string' && TRANSIENT_ADAPTER_KINDS.has(kind)) {
      return true;
    }
    if (typeof originalCode === 'string' && isTransientSqlState(originalCode)) {
      return true;
    }
    if (
      typeof message === 'string' &&
      TRANSIENT_PG_MESSAGES.some((text) => message.includes(text))
    ) {
      return true;
    }

    current = meta?.driverAdapterError ?? cause;
  }

  return false;
};
