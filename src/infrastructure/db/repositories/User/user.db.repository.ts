import { Injectable } from '@nestjs/common';
import { User } from '@domain/User/entities/user.entity';
import { IUserDbRepository } from '@domain/User/repositories/user.db.repository.inter';
import { PrismaService } from '@infrastructure/db/services/prisma.service';
import UserMapper from '@infrastructure/mappers/User/user.mapper';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { UsernameVO } from '@domain/User/value-objects/username.vo';
import { Prisma } from '@prisma-client/generated/prisma/client';
import { EmailVO } from '@domain/User/value-objects/email.vo';
import {
  EmailAlreadyTakenError,
  PhoneNumberAlreadyTakenError,
  UserAlreadyExistsError,
  UsernameAlreadyTakenError,
  UserNotFoundError,
} from '@domain/User/errors/user.errors';
import {
  UserLoginRecord,
  UserProfilePatch,
} from '@domain/User/types/userUpdate.type';
import { UserSessionState } from '@domain/User/types/userSessionState.type';
import { Follow as FollowPrisma } from '@prisma-client/generated/prisma/client';
import { publishFollowEvents } from '@infrastructure/db/repositories/Follow/followTransaction.util';

// Собирает имена полей/индекса нарушенного unique-ограничения.
// С adapter-pg они лежат в meta.driverAdapterError.cause.constraint
// ({ index: 'users_username_key' } или { fields: ['username'] }),
// у нативного движка — в meta.target
const uniqueViolationTargets = (
  error: Prisma.PrismaClientKnownRequestError,
): string => {
  const meta = (error.meta ?? {}) as {
    target?: string | string[];
    driverAdapterError?: {
      cause?: { constraint?: { fields?: string[]; index?: string } };
    };
  };
  const constraint = meta.driverAdapterError?.cause?.constraint;

  return [
    ...[meta.target ?? []].flat(),
    ...(constraint?.fields ?? []),
    constraint?.index ?? '',
  ]
    .join(' ')
    .toLowerCase();
};

const toUniqueViolationError = (
  error: Prisma.PrismaClientKnownRequestError,
): Error => {
  const targets = uniqueViolationTargets(error);

  if (targets.includes('phonenumber')) {
    return new PhoneNumberAlreadyTakenError();
  }
  if (targets.includes('email')) {
    return new EmailAlreadyTakenError();
  }
  if (targets.includes('username')) {
    return new UsernameAlreadyTakenError();
  }
  return new UserAlreadyExistsError();
};

// P2002 — конкретная 409 по нарушенному unique, P2025 — строки для update нет
const toDomainError = (error: unknown): unknown => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return toUniqueViolationError(error);
    }
    if (error.code === 'P2025') {
      return new UserNotFoundError();
    }
  }
  return error;
};

@Injectable()
export class UserDbRepository implements IUserDbRepository {
  constructor(private readonly orm: PrismaService) {}

  async create(user: User): Promise<User> {
    try {
      const createdUser = await this.orm.user.create({
        data: {
          id: user.id.toString(),
          username: user.username.toString(),
          email: user.email.toString(),
          passwordHash: user.passwordHash,
          phoneNumber: user.phoneNumber.toString(),
          displayName: user.displayName,
          bio: user.bio,
          profilePhotoUrl: user.profilePhotoUrl,
          dateOfBirth: user.dateOfBirth.value,
          gender: user.gender,
          websiteUrl: user.websiteUrl,
          roles: user.roles,
          isVerified: user.isVerified,
          isPrivate: user.isPrivate,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          followersCount: user.followersCount,
          followingsCount: user.followingsCount,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });

      return UserMapper.toDomain(createdUser);
    } catch (error: unknown) {
      throw toDomainError(error);
    }
  }

  // undefined в patch Prisma пропускает — пишутся только переданные колонки
  updateProfile(id: UserIdVO, patch: UserProfilePatch): Promise<User> {
    return this.update(id, {
      displayName: patch.displayName,
      bio: patch.bio,
      websiteUrl: patch.websiteUrl,
      gender: patch.gender,
      isPrivate: patch.isPrivate,
    });
  }

  updatePasswordHash(id: UserIdVO, passwordHash: string): Promise<User> {
    return this.update(id, { passwordHash });
  }

  updateUsername(id: UserIdVO, username: UsernameVO): Promise<User> {
    return this.update(id, { username: username.toString() });
  }

  updateEmail(id: UserIdVO, email: EmailVO): Promise<User> {
    return this.update(id, { email: email.toString(), emailVerified: false });
  }

  updateActive(id: UserIdVO, isActive: boolean): Promise<User> {
    return this.update(id, { isActive });
  }

  async recordLogin(id: UserIdVO, record: UserLoginRecord): Promise<User> {
    const { lastLoginAt, passwordRehash } = record;

    if (passwordRehash) {
      // Условный UPDATE: если пароль успели сменить, перехеш не применяется
      await this.orm.user.updateMany({
        where: {
          id: id.toString(),
          passwordHash: passwordRehash.previousHash,
        },
        data: { passwordHash: passwordRehash.newHash },
      });
    }

    return this.update(id, { lastLoginAt });
  }

  async incrementTokenVersion(id: UserIdVO): Promise<number> {
    try {
      const { tokenVersion } = await this.orm.user.update({
        where: { id: id.toString() },
        data: { tokenVersion: { increment: 1 } },
        select: { tokenVersion: true },
      });

      return tokenVersion;
    } catch (error: unknown) {
      throw toDomainError(error);
    }
  }

  async findSessionState(id: UserIdVO): Promise<UserSessionState | null> {
    return this.orm.user.findUnique({
      where: { id: id.toString() },
      select: { tokenVersion: true, isActive: true },
    });
  }

  async deleteAccount(id: UserIdVO): Promise<number> {
    const userId = id.toString();

    return this.orm.$transaction(
      async (tx) => {
        // FOR UPDATE конфликтует с KEY SHARE проверки FK: пока транзакция идёт,
        // новая подписка/заявка на этого пользователя не появится, иначе каскад
        // удалил бы её без события и счётчик подписчика разошёлся бы
        const locked = await tx.$queryRaw<{ id: string }[]>`
          SELECT "id" FROM "users" WHERE "id" = ${userId} FOR UPDATE
        `;

        if (locked.length === 0) {
          throw new UserNotFoundError();
        }

        const removedFollows = await tx.$queryRaw<FollowPrisma[]>`
          DELETE FROM "follows"
          WHERE "followerId" = ${userId} OR "followingId" = ${userId}
          RETURNING "id", "followerId", "followingId", "createdAt"
        `;

        await publishFollowEvents(
          tx,
          'unfollow',
          removedFollows.map((follow) => ({
            ...follow,
            createdAt: new Date(follow.createdAt),
          })),
        );

        // follow_requests и user_blocks удаляются каскадом
        await tx.user.delete({ where: { id: userId } });

        return removedFollows.length;
      },
      { timeout: 30_000, maxWait: 10_000 },
    );
  }

  private async update(
    id: UserIdVO,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    try {
      const updatedUser = await this.orm.user.update({
        where: { id: id.toString() },
        data,
      });

      return UserMapper.toDomain(updatedUser);
    } catch (error: unknown) {
      throw toDomainError(error);
    }
  }

  async findById(id: UserIdVO): Promise<User | null> {
    const findUser = await this.orm.user.findUnique({
      where: {
        id: id.toString(),
      },
    });

    return findUser ? UserMapper.toDomain(findUser) : null;
  }

  async findByUsername(username: UsernameVO): Promise<User | null> {
    const findUser = await this.orm.user.findUnique({
      where: {
        username: username.toString(),
      },
    });

    return findUser ? UserMapper.toDomain(findUser) : null;
  }

  async existsByUsername(username: UsernameVO): Promise<boolean> {
    const count = await this.orm.user.count({
      where: {
        username: username.toString(),
      },
    });

    return count > 0;
  }

  async existsByEmail(email: EmailVO): Promise<boolean> {
    const count = await this.orm.user.count({
      where: {
        email: email.toString(),
      },
    });

    return count > 0;
  }
}
