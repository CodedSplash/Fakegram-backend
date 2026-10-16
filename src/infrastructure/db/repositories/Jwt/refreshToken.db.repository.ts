import { Injectable } from '@nestjs/common';
import { RefreshToken } from '@domain/Jwt/entities/refreshToken.entity';
import { IRefreshTokenDbRepository } from '@domain/Jwt/repositories/refreshToken.db.repository.inter';
import { PrismaService } from '@infrastructure/db/services/prisma.service';
import RefreshTokenMapper from '@infrastructure/mappers/Jwt/refreshToken.mapper';
import { UsernameVO } from '@domain/User/value-objects/username.vo';
import { RefreshTokenHashVO } from '@domain/Jwt/value-objects/refreshTokenHash.vo';
import { Prisma } from '@prisma-client/generated/prisma/client';
import { RefreshTokenAlreadyExistsError } from '@domain/Jwt/errors/jwt.errors';

@Injectable()
export class RefreshTokenDbRepository implements IRefreshTokenDbRepository {
  constructor(private readonly orm: PrismaService) {}

  async findByUsername(username: UsernameVO): Promise<RefreshToken | null> {
    const token = await this.orm.refreshToken.findUnique({
      where: {
        username: username.toString(),
      },
    });

    return token ? RefreshTokenMapper.toDomain(token) : null;
  }

  async upsert(token: RefreshToken): Promise<void> {
    try {
      // Один запрос вместо delete + create: замена сессии атомарна
      await this.orm.refreshToken.upsert({
        where: {
          username: token.username.toString(),
        },
        create: {
          id: token.id.toString(),
          username: token.username.toString(),
          tokenHash: token.tokenHash.toString(),
          createdAt: token.createdAt,
        },
        update: {
          tokenHash: token.tokenHash.toString(),
          createdAt: token.createdAt,
        },
      });
    } catch (error: unknown) {
      this.handleUniqueError(error);
    }
  }

  async rotate(
    username: UsernameVO,
    currentTokenHash: RefreshTokenHashVO,
    newTokenHash: RefreshTokenHashVO,
  ): Promise<boolean> {
    try {
      // Условный UPDATE: при конкурентной ротации одного токена
      // строку обновит только первый запрос, остальные получат count = 0
      const { count } = await this.orm.refreshToken.updateMany({
        where: {
          username: username.toString(),
          tokenHash: currentTokenHash.toString(),
        },
        data: {
          tokenHash: newTokenHash.toString(),
          createdAt: new Date(),
        },
      });

      return count === 1;
    } catch (error: unknown) {
      this.handleUniqueError(error);
    }
  }

  async deleteByUsername(username: UsernameVO): Promise<void> {
    await this.orm.refreshToken.deleteMany({
      where: {
        username: username.toString(),
      },
    });
  }

  private handleUniqueError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new RefreshTokenAlreadyExistsError();
    }
    throw error;
  }
}
