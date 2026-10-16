import {
  Follow as FollowPrisma,
  Prisma,
} from '@prisma-client/generated/prisma/client';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { FollowEventType } from '@domain/Follow/events/follow.event.type';

export const FOLLOW_AGGREGATE_TYPE = 'follow';

// Подписка, запрос, принятие и блокировка одной пары пользователей идут строго
// по очереди: advisory-lock на неупорядоченную пару до конца транзакции.
// Без него блокировка и параллельная подписка могут оставить подписку
// при существующей блокировке.
export const lockUserPair = async (
  tx: Prisma.TransactionClient,
  a: UserIdVO | string,
  b: UserIdVO | string,
): Promise<void> => {
  const [first, second] = [a.toString(), b.toString()].sort();

  // executeRaw: результат pg_advisory_xact_lock (void) не нужно десериализовать.
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${first}:${second}`}, 0))`;
};

export const isBlockedBetween = async (
  tx: Prisma.TransactionClient,
  a: UserIdVO | string,
  b: UserIdVO | string,
): Promise<boolean> => {
  const [row] = await tx.$queryRaw<{ isBlocked: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM "user_blocks" AS b
      WHERE (b."blockerId" = ${a.toString()} AND b."blockedId" = ${b.toString()})
         OR (b."blockerId" = ${b.toString()} AND b."blockedId" = ${a.toString()})
    ) AS "isBlocked"
  `;

  return row.isBlocked;
};

type TargetAccountState = { isPrivate: boolean; isActive: boolean };

// FOR SHARE конфликтует с UPDATE users (NO KEY UPDATE): смена приватности
// и подписка/запрос выполняются строго по очереди, а решение «подписка или
// запрос» принимается по актуальному значению isPrivate.
export const lockTargetAccountState = async (
  tx: Prisma.TransactionClient,
  targetId: UserIdVO | string,
): Promise<TargetAccountState | null> => {
  const [row] = await tx.$queryRaw<TargetAccountState[]>`
    SELECT "isPrivate", "isActive" FROM "users"
    WHERE "id" = ${targetId.toString()}
    FOR SHARE
  `;

  return row ?? null;
};

// Любое создание/удаление строки follows обязано пройти через outbox в той же
// транзакции, иначе счётчики разойдутся. Строку outbox сразу удаляем:
// Debezium читает INSERT из WAL.
export const publishFollowEvents = async (
  tx: Prisma.TransactionClient,
  type: FollowEventType,
  follows: FollowPrisma[],
): Promise<void> => {
  if (follows.length === 0) return;

  const events = await tx.outboxEvent.createManyAndReturn({
    data: follows.map((follow) => toOutboxEvent(type, follow)),
    select: { id: true },
  });

  await tx.outboxEvent.deleteMany({
    where: { id: { in: events.map((event) => event.id) } },
  });
};

const toOutboxEvent = (
  type: FollowEventType,
  follow: FollowPrisma,
): Prisma.OutboxEventCreateManyInput => ({
  aggregateType: FOLLOW_AGGREGATE_TYPE,
  aggregateId: `${follow.followerId}_${follow.followingId}`,
  type,
  payload: {
    id: follow.id,
    followerId: follow.followerId,
    followingId: follow.followingId,
    createdAt: follow.createdAt.toISOString(),
  },
});
