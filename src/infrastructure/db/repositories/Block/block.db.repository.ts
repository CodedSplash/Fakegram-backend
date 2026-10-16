import { Injectable } from '@nestjs/common';
import {
  Follow as FollowPrisma,
  Prisma,
} from '@prisma-client/generated/prisma/client';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import {
  BlockListCursor,
  BlockListItem,
} from '@domain/Block/types/blockListItem.type';
import { IBlockDbRepository } from '@domain/Block/repositories/block.db.repository.inter';
import { PrismaService } from '@infrastructure/db/services/prisma.service';
import {
  AlreadyBlockedError,
  NotBlockedError,
} from '@domain/Block/errors/block.errors';
import { UserNotFoundError } from '@domain/User/errors/user.errors';
import {
  lockUserPair,
  publishFollowEvents,
} from '@infrastructure/db/repositories/Follow/followTransaction.util';

@Injectable()
export class BlockDbRepository implements IBlockDbRepository {
  constructor(private readonly orm: PrismaService) {}

  async block(blockerId: UserIdVO, blockedId: UserIdVO): Promise<void> {
    const a = blockerId.toString();
    const b = blockedId.toString();

    try {
      await this.orm.$transaction(async (tx) => {
        // Тот же lock, что у подписки/запроса/принятия: после коммита
        // новых подписок и запросов между пользователями не появится.
        await lockUserPair(tx, a, b);

        await tx.userBlock.create({ data: { blockerId: a, blockedId: b } });

        // DELETE ... RETURNING: событие только для реально удалённых строк,
        // параллельная отписка не даст двойного декремента счётчиков.
        const deletedFollows = await tx.$queryRaw<FollowPrisma[]>`
          DELETE FROM "follows"
          WHERE ("followerId" = ${a} AND "followingId" = ${b})
             OR ("followerId" = ${b} AND "followingId" = ${a})
          RETURNING "id", "followerId", "followingId", "createdAt"
        `;

        await publishFollowEvents(
          tx,
          'unfollow',
          deletedFollows.map((follow) => ({
            ...follow,
            createdAt: new Date(follow.createdAt),
          })),
        );

        await tx.followRequest.deleteMany({
          where: {
            OR: [
              { requesterId: a, targetId: b },
              { requesterId: b, targetId: a },
            ],
          },
        });
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AlreadyBlockedError();
        }
        if (error.code === 'P2003') {
          throw new UserNotFoundError();
        }
      }
      throw error;
    }
  }

  async unblock(blockerId: UserIdVO, blockedId: UserIdVO): Promise<void> {
    const { count } = await this.orm.userBlock.deleteMany({
      where: {
        blockerId: blockerId.toString(),
        blockedId: blockedId.toString(),
      },
    });

    if (count === 0) {
      throw new NotBlockedError();
    }
  }

  // Фильтр по префиксу PK (blockerId); списки блокировок небольшие, сортировка
  // (createdAt DESC, blockedId DESC) без отдельного индекса.
  // Деактивированные пользователи в список не попадают.
  async findBlocked(
    blockerId: UserIdVO,
    limit: number,
    cursor?: BlockListCursor,
  ): Promise<BlockListItem[]> {
    // createdAt — timestamp(3) без зоны, Prisma хранит UTC: зона из ISO отбрасывается.
    const cursorCondition = cursor
      ? Prisma.sql`AND (b."createdAt", b."blockedId") < (${cursor.createdAt.toISOString()}::timestamp(3), ${cursor.blockedId})`
      : Prisma.empty;

    const rows = await this.orm.$queryRaw<BlockListItem[]>`
      SELECT
        u."id",
        u."username",
        u."displayName",
        u."profilePhotoUrl",
        u."isVerified",
        b."createdAt" AS "blockedAt"
      FROM "user_blocks" AS b
      JOIN "users" AS u ON u."id" = b."blockedId"
      WHERE b."blockerId" = ${blockerId.toString()}
        AND u."isActive" = true
      ${cursorCondition}
      ORDER BY b."createdAt" DESC, b."blockedId" DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      ...row,
      blockedAt: new Date(row.blockedAt),
    }));
  }
}
