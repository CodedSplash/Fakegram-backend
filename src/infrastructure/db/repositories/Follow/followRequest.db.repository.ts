import { createId } from '@paralleldrive/cuid2';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/generated/prisma/client';
import { Follow } from '@domain/Follow/entities/follow.entity';
import { FollowRequest } from '@domain/Follow/entities/followRequest.entity';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import {
  AcceptFollowRequestsBatchResult,
  FollowRequestListCursor,
  FollowRequestListItem,
} from '@domain/Follow/types/followRequestListItem.type';
import { IFollowRequestDbRepository } from '@domain/Follow/repositories/followRequest.db.repository.inter';
import { PrismaService } from '@infrastructure/db/services/prisma.service';
import {
  AccountPrivacyChangedError,
  AlreadyFollowingError,
} from '@domain/Follow/errors/follow.errors';
import {
  FollowRequestAlreadyExistsError,
  FollowRequestNotFoundError,
} from '@domain/Follow/errors/followRequest.errors';
import { UserBlockedError } from '@domain/Block/errors/block.errors';
import { UserNotFoundError } from '@domain/User/errors/user.errors';
import {
  isBlockedBetween,
  lockTargetAccountState,
  lockUserPair,
  publishFollowEvents,
} from '@infrastructure/db/repositories/Follow/followTransaction.util';

type FollowRequestPairRow = { requesterId: string; targetId: string };

@Injectable()
export class FollowRequestDbRepository implements IFollowRequestDbRepository {
  constructor(private readonly orm: PrismaService) {}

  async save(request: FollowRequest): Promise<void> {
    try {
      await this.orm.$transaction(async (tx) => {
        await lockUserPair(tx, request.requesterId, request.targetId);

        if (await isBlockedBetween(tx, request.requesterId, request.targetId)) {
          throw new UserBlockedError();
        }

        // Аккаунт мог стать открытым: тогда заявка повисла бы навсегда,
        // потому что заявки принимаются автоматически только при самой смене
        const target = await lockTargetAccountState(tx, request.targetId);

        if (!target || !target.isActive) {
          throw new UserNotFoundError();
        }
        if (!target.isPrivate) {
          throw new AccountPrivacyChangedError();
        }

        const followsCount = await tx.follow.count({
          where: {
            followerId: request.requesterId.toString(),
            followingId: request.targetId.toString(),
          },
        });

        if (followsCount > 0) {
          throw new AlreadyFollowingError();
        }

        await tx.followRequest.create({
          data: {
            id: request.id.toString(),
            requesterId: request.requesterId.toString(),
            targetId: request.targetId.toString(),
            createdAt: request.createdAt,
          },
        });
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new FollowRequestAlreadyExistsError();
        }
        if (error.code === 'P2003') {
          throw new UserNotFoundError();
        }
      }
      throw error;
    }
  }

  async accept(follow: Follow): Promise<void> {
    await this.orm.$transaction(async (tx) => {
      await lockUserPair(tx, follow.followerId, follow.followingId);

      // Блокировка удаляет запросы под тем же lock: раз запрос есть — блокировки нет.
      const { count } = await tx.followRequest.deleteMany({
        where: {
          requesterId: follow.followerId.toString(),
          targetId: follow.followingId.toString(),
        },
      });

      if (count === 0) {
        throw new FollowRequestNotFoundError();
      }

      // Деактивированный отправитель скрыт из списка заявок — принять его
      // заявку тоже нельзя (откат транзакции оставляет заявку на месте)
      const [requester] = await tx.$queryRaw<{ isActive: boolean }[]>`
        SELECT "isActive" FROM "users" WHERE "id" = ${follow.followerId.toString()}
      `;

      if (!requester?.isActive) {
        throw new FollowRequestNotFoundError();
      }

      // Подписка уже могла появиться — тогда события нет, запрос просто удалён.
      const created = await tx.follow.createManyAndReturn({
        data: [
          {
            id: follow.id.toString(),
            followerId: follow.followerId.toString(),
            followingId: follow.followingId.toString(),
            createdAt: follow.createdAt,
          },
        ],
        skipDuplicates: true,
      });

      await publishFollowEvents(tx, 'follow', created);
    });
  }

  async delete(requesterId: UserIdVO, targetId: UserIdVO): Promise<void> {
    const { count } = await this.orm.followRequest.deleteMany({
      where: {
        requesterId: requesterId.toString(),
        targetId: targetId.toString(),
      },
    });

    if (count === 0) {
      throw new FollowRequestNotFoundError();
    }
  }

  // Индекс (targetId, createdAt DESC, id DESC) покрывает фильтр, сортировку
  // и курсор. Деактивированные отправители в список не попадают.
  async findIncoming(
    targetId: UserIdVO,
    limit: number,
    cursor?: FollowRequestListCursor,
  ): Promise<FollowRequestListItem[]> {
    // createdAt — timestamp(3) без зоны, Prisma хранит UTC: зона из ISO отбрасывается.
    const cursorCondition = cursor
      ? Prisma.sql`AND (r."createdAt", r."id") < (${cursor.createdAt.toISOString()}::timestamp(3), ${cursor.requestId})`
      : Prisma.empty;

    const rows = await this.orm.$queryRaw<FollowRequestListItem[]>`
      SELECT
        r."id" AS "requestId",
        u."id",
        u."username",
        u."displayName",
        u."profilePhotoUrl",
        u."isVerified",
        r."createdAt" AS "requestedAt"
      FROM "follow_requests" AS r
      JOIN "users" AS u ON u."id" = r."requesterId"
      WHERE r."targetId" = ${targetId.toString()}
        AND u."isActive" = true
      ${cursorCondition}
      ORDER BY r."createdAt" DESC, r."id" DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      ...row,
      requestedAt: new Date(row.requestedAt),
    }));
  }

  async acceptBatch(
    ownerId: UserIdVO,
    limit: number,
  ): Promise<AcceptFollowRequestsBatchResult> {
    return this.orm.$transaction(
      async (tx) => {
        // Заявки деактивированных отправителей пропускаются и остаются висеть:
        // после восстановления аккаунта прямая подписка заменит заявку
        const selected = await tx.followRequest.findMany({
          where: {
            targetId: ownerId.toString(),
            requester: { isActive: true },
          },
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          take: limit,
          select: { id: true, requesterId: true },
        });

        if (selected.length === 0) return { selected: 0, accepted: 0 };

        // Все пары содержат ownerId, поэтому lock в порядке requesterId —
        // единый порядок для всех транзакций, без deadlock.
        const requesterIds = selected.map((r) => r.requesterId).sort();
        for (const requesterId of requesterIds) {
          await lockUserPair(tx, requesterId, ownerId);
        }

        // Пока ждали lock, часть запросов могли отменить, отклонить или удалить
        // блокировкой — принимаем только оставшиеся.
        const deleted = await tx.$queryRaw<FollowRequestPairRow[]>`
          DELETE FROM "follow_requests"
          WHERE "id" IN (${Prisma.join(selected.map((r) => r.id))})
          RETURNING "requesterId", "targetId"
        `;

        if (deleted.length === 0) {
          return { selected: selected.length, accepted: 0 };
        }

        const createdAt = new Date();
        const created = await tx.follow.createManyAndReturn({
          data: deleted.map((r) => ({
            id: createId(),
            followerId: r.requesterId,
            followingId: r.targetId,
            createdAt,
          })),
          skipDuplicates: true,
        });

        await publishFollowEvents(tx, 'follow', created);

        return { selected: selected.length, accepted: created.length };
      },
      { timeout: 30_000, maxWait: 10_000 },
    );
  }
}
