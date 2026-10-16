import { InvalidCursorError } from '@domain/Follow/errors/follow.errors';
import {
  FollowListCursor,
  FollowListItem,
} from '@domain/Follow/types/followListItem.type';
import { FollowListOutputDto } from '@application/Follow/dtos/followList.output.dto';

const SEPARATOR = '|';

// Курсор непрозрачен для клиента: base64url от `createdAt|followId`.
export const encodeFollowListCursor = (cursor: FollowListCursor): string =>
  Buffer.from(
    `${cursor.createdAt.toISOString()}${SEPARATOR}${cursor.followId}`,
  ).toString('base64url');

export const decodeFollowListCursor = (
  cursor?: string,
): FollowListCursor | undefined => {
  if (!cursor) return undefined;

  const [createdAt, followId, ...rest] = Buffer.from(cursor, 'base64url')
    .toString('utf8')
    .split(SEPARATOR);
  const date = new Date(createdAt);

  if (rest.length > 0 || !followId || Number.isNaN(date.getTime())) {
    throw new InvalidCursorError();
  }

  return { createdAt: date, followId };
};

// Репозиторий запрашивается с limit + 1: лишняя запись — признак следующей страницы.
export const toFollowListPage = (
  rows: FollowListItem[],
  limit: number,
): FollowListOutputDto => {
  const page = rows.slice(0, limit);
  const last = page[page.length - 1];

  return {
    items: page.map((item) => ({
      id: item.id,
      username: item.username,
      displayName: item.displayName,
      profilePhotoUrl: item.profilePhotoUrl,
      isVerified: item.isVerified,
      followedAt: item.followedAt,
    })),
    nextCursor:
      rows.length > limit
        ? encodeFollowListCursor({
            createdAt: last.followedAt,
            followId: last.followId,
          })
        : null,
  };
};
