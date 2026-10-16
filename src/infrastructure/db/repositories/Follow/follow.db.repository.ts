import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma-client/generated/prisma/client';
import { Follow } from '@domain/Follow/entities/follow.entity';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { FollowEvent } from '@domain/Follow/events/follow.event.type';
import {
  FollowListCursor,
  FollowListItem,
} from '@domain/Follow/types/followListItem.type';
import { FollowListAccess } from '@domain/Follow/types/followListAccess.type';
import { FollowRelation } from '@domain/Follow/types/followRelation.type';
import FollowMapper from '@infrastructure/mappers/Follow/follow.mapper';
import { PrismaService } from '@infrastructure/db/services/prisma.service';
import { IFollowDbRepository } from '@domain/Follow/repositories/follow.db.repository.inter';
import {
  AccountPrivacyChangedError,
  AlreadyFollowingError,
  NotFollowingError,
} from '@domain/Follow/errors/follow.errors';
import { UserNotFoundError } from '@domain/User/errors/user.errors';
import { UserBlockedError } from '@domain/Block/errors/block.errors';
import {
  isBlockedBetween,
  lockTargetAccountState,
  lockUserPair,
  publishFollowEvents,
} from '@infrastructure/db/repositories/Follow/followTransaction.util';

type FollowCountersRow = {
  id: string;
  followersCount: number;
  followingsCount: number;
};

type FollowListRow = {
  followId: string;
  id: string;
  username: string;
  displayName: string | null;
  profilePhotoUrl: string | null;
  isVerified: boolean;
  followedAt: Date;
};

@Injectable()
export class FollowDbRepository implements IFollowDbRepository {
  private readonly logger = new Logger(FollowDbRepository.name);

  constructor(private readonly orm: PrismaService) {}

  async save(follow: Follow): Promise<Follow> {
    try {
      const newFollow = await this.orm.$transaction(async (tx) => {
        await lockUserPair(tx, follow.followerId, follow.followingId);

        if (await isBlockedBetween(tx, follow.followerId, follow.followingId)) {
          throw new UserBlockedError();
        }

        const target = await lockTargetAccountState(tx, follow.followingId);

        if (!target || !target.isActive) {
          throw new UserNotFoundError();
        }
        if (target.isPrivate) {
          throw new AccountPrivacyChangedError();
        }

        const createdFollow = await tx.follow.create({
          data: {
            id: follow.id.toString(),
            followerId: follow.followerId.toString(),
            followingId: follow.followingId.toString(),
            createdAt: follow.createdAt,
          },
        });

        // Аккаунт мог стать открытым, пока висел запрос: подписка его заменяет.
        await tx.followRequest.deleteMany({
          where: {
            requesterId: createdFollow.followerId,
            targetId: createdFollow.followingId,
          },
        });

        await publishFollowEvents(tx, 'follow', [createdFollow]);

        return createdFollow;
      });

      return FollowMapper.toDomain(newFollow);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AlreadyFollowingError();
        }
        if (error.code === 'P2003') {
          throw new UserNotFoundError();
        }
      }
      throw error;
    }
  }

  async deleteByFollowerAndFollowingId(
    followerId: UserIdVO,
    followingId: UserIdVO,
  ): Promise<void> {
    try {
      await this.orm.$transaction(async (tx) => {
        const deletedFollow = await tx.follow.delete({
          where: {
            followerId_followingId: {
              followerId: followerId.toString(),
              followingId: followingId.toString(),
            },
          },
        });

        await publishFollowEvents(tx, 'unfollow', [deletedFollow]);
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFollowingError();
      }
      throw error;
    }
  }

  async findFollowers(
    userId: UserIdVO,
    viewerId: UserIdVO,
    limit: number,
    cursor?: FollowListCursor,
  ): Promise<FollowListItem[]> {
    return this.findFollowList('followers', userId, viewerId, limit, cursor);
  }

  async findFollowings(
    userId: UserIdVO,
    viewerId: UserIdVO,
    limit: number,
    cursor?: FollowListCursor,
  ): Promise<FollowListItem[]> {
    return this.findFollowList('followings', userId, viewerId, limit, cursor);
  }

  async findFollowListAccess(
    ownerId: UserIdVO,
    viewerId: UserIdVO,
  ): Promise<FollowListAccess | null> {
    // Поиск по PK users + проверка по уникальному (followerId, followingId).
    const [row] = await this.orm.$queryRaw<FollowListAccess[]>`
      SELECT
        u."isActive",
        u."isPrivate",
        EXISTS (
          SELECT 1 FROM "follows" AS f
          WHERE f."followerId" = ${viewerId.toString()}
            AND f."followingId" = u."id"
        ) AS "isViewerFollowing",
        EXISTS (
          SELECT 1 FROM "user_blocks" AS b
          WHERE (b."blockerId" = u."id" AND b."blockedId" = ${viewerId.toString()})
             OR (b."blockerId" = ${viewerId.toString()} AND b."blockedId" = u."id")
        ) AS "isBlocked"
      FROM "users" AS u
      WHERE u."id" = ${ownerId.toString()}
    `;

    return row ?? null;
  }

  async findRelation(
    viewerId: UserIdVO,
    targetId: UserIdVO,
  ): Promise<FollowRelation | null> {
    const viewer = viewerId.toString();

    // Всё — поиск по PK/уникальным индексам.
    const [row] = await this.orm.$queryRaw<FollowRelation[]>`
      SELECT
        u."isActive",
        u."isPrivate",
        EXISTS (
          SELECT 1 FROM "users" AS v WHERE v."id" = ${viewer}
        ) AS "isViewerExists",
        EXISTS (
          SELECT 1 FROM "follows" AS f
          WHERE f."followerId" = ${viewer} AND f."followingId" = u."id"
        ) AS "isFollowing",
        EXISTS (
          SELECT 1 FROM "follow_requests" AS r
          WHERE r."requesterId" = ${viewer} AND r."targetId" = u."id"
        ) AS "isRequested",
        EXISTS (
          SELECT 1 FROM "user_blocks" AS b
          WHERE (b."blockerId" = u."id" AND b."blockedId" = ${viewer})
             OR (b."blockerId" = ${viewer} AND b."blockedId" = u."id")
        ) AS "isBlocked"
      FROM "users" AS u
      WHERE u."id" = ${targetId.toString()}
    `;

    return row ?? null;
  }

  async applyBatch(events: FollowEvent[]): Promise<UserIdVO[]> {
    return this.orm.$transaction(
      async (tx) => {
        const inserted = await tx.processedEvent.createManyAndReturn({
          data: events.map((e) => ({ eventId: e.id })),
          skipDuplicates: true,
          select: { eventId: true },
        });
        const fresh = new Set(inserted.map((r) => r.eventId));

        const deltas = new Map<
          string,
          { followers: number; followings: number }
        >();

        const add = (
          id: string,
          key: 'followers' | 'followings',
          delta: number,
        ) => {
          const values = deltas.get(id) ?? { followers: 0, followings: 0 };
          values[key] += delta;
          deltas.set(id, values);
        };

        for (const event of events) {
          if (!fresh.delete(event.id)) continue;
          const delta = event.type === 'follow' ? 1 : -1;
          add(event.payload.followerId, 'followings', delta);
          add(event.payload.followingId, 'followers', delta);
        }

        const rows = [...deltas].filter(
          ([, d]) => d.followers !== 0 || d.followings !== 0,
        );

        if (rows.length === 0) return [];

        // Блокировка строк в одном порядке во всех транзакциях — без deadlock
        // между экземплярами consumer, и точные текущие значения для проверки.
        // NO KEY UPDATE, а не UPDATE: не конфликтует с KEY SHARE, который берёт
        // проверка FK при вставке в follows, иначе подписка и consumer ловят deadlock.
        const current = await tx.$queryRaw<FollowCountersRow[]>`
          SELECT "id", "followersCount", "followingsCount"
          FROM "users"
          WHERE "id" IN (${Prisma.join(rows.map(([id]) => id))})
          ORDER BY "id"
          FOR NO KEY UPDATE
        `;

        const clamped = current.filter((user) => {
          const d = deltas.get(user.id);
          return (
            user.followersCount + d.followers < 0 ||
            user.followingsCount + d.followings < 0
          );
        });

        if (clamped.length > 0) {
          this.logger.warn(
            `Follow counters would become negative, clamped to 0 for users: ${clamped
              .map((user) => user.id)
              .join(', ')}`,
          );
        }

        await tx.$executeRaw`
          UPDATE "users" AS u SET
            "followersCount" = GREATEST(u."followersCount" + d.followers, 0),
            "followingsCount" = GREATEST(u."followingsCount" + d.followings, 0)
          FROM (VALUES ${Prisma.join(
            rows.map(
              ([id, d]) =>
                Prisma.sql`(${id}, ${d.followers}::int, ${d.followings}::int)`,
            ),
          )}) AS d(id, followers, followings)
          WHERE u."id" = d.id
        `;

        return rows.map(([id]) => new UserIdVO(id));
      },
      { timeout: 30_000, maxWait: 10_000 },
    );
  }

  // Followers: WHERE followingId = $1, в выдаче — follower; followings — наоборот.
  // Индексы (followingId|followerId, createdAt DESC, id DESC) покрывают
  // и фильтр, и сортировку, и сравнение кортежей для курсора.
  // Деактивированные пользователи в списки не попадают, как и связанные
  // с просматривающим блокировкой в любую сторону (два поиска по PK user_blocks).
  private async findFollowList(
    direction: 'followers' | 'followings',
    userId: UserIdVO,
    viewerId: UserIdVO,
    limit: number,
    cursor?: FollowListCursor,
  ): Promise<FollowListItem[]> {
    const isFollowers = direction === 'followers';
    const filterColumn = Prisma.raw(
      isFollowers ? 'f."followingId"' : 'f."followerId"',
    );
    const joinColumn = Prisma.raw(
      isFollowers ? 'f."followerId"' : 'f."followingId"',
    );
    // createdAt — timestamp(3) без зоны, Prisma хранит UTC: зона из ISO отбрасывается.
    const cursorCondition = cursor
      ? Prisma.sql`AND (f."createdAt", f."id") < (${cursor.createdAt.toISOString()}::timestamp(3), ${cursor.followId})`
      : Prisma.empty;

    const rows = await this.orm.$queryRaw<FollowListRow[]>`
      SELECT
        f."id" AS "followId",
        u."id",
        u."username",
        u."displayName",
        u."profilePhotoUrl",
        u."isVerified",
        f."createdAt" AS "followedAt"
      FROM "follows" AS f
      JOIN "users" AS u ON u."id" = ${joinColumn}
      WHERE ${filterColumn} = ${userId.toString()}
        AND u."isActive" = true
        AND NOT EXISTS (
          SELECT 1 FROM "user_blocks" AS b
          WHERE b."blockerId" = ${viewerId.toString()} AND b."blockedId" = u."id"
        )
        AND NOT EXISTS (
          SELECT 1 FROM "user_blocks" AS b
          WHERE b."blockerId" = u."id" AND b."blockedId" = ${viewerId.toString()}
        )
      ${cursorCondition}
      ORDER BY f."createdAt" DESC, f."id" DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      ...row,
      followedAt: new Date(row.followedAt),
    }));
  }
}
