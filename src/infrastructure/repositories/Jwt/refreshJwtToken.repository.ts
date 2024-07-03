import { Injectable } from '@nestjs/common';
import { RefreshTokenDto } from '../../../application/dtos/Jwt/refreshToken.dto';
import { IRefreshJwtToken } from '../../../core/Jwt/entities/refreshJwtToken.entity';
import { IRefreshJwtTokenRepository } from '../../../core/Jwt/repositories/refreshJwtToken.repository.interface';
import { PrismaService } from '../../db/orm/prisma.service';
import RefreshTokenMapper from '../../mappers/Jwt/refreshToken.mapper';

@Injectable()
export class RefreshJwtTokenRepository implements IRefreshJwtTokenRepository {
  constructor(private readonly orm: PrismaService) {}

  async getRefreshToken(
    refreshToken: string,
  ): Promise<IRefreshJwtToken | null> {
    const token = await this.orm.token.findUnique({
      where: {
        token: refreshToken,
      },
    });

    if (!token) return null;

    return RefreshTokenMapper.toDomain(token);
  }

  async saveRefreshToken(dto: RefreshTokenDto): Promise<IRefreshJwtToken> {
    const token = await this.orm.token.create({
      data: {
        username: dto.username,
        token: dto.refreshToken,
      },
    });

    return RefreshTokenMapper.toDomain(token);
  }

  async updateRefreshToken(
    dto: RefreshTokenDto,
  ): Promise<IRefreshJwtToken | null> {
    const token = await this.orm.token.update({
      where: {
        username: dto.username,
      },
      data: {
        token: dto.refreshToken,
      },
    });

    if (!token) return null;

    return RefreshTokenMapper.toDomain(token);
  }

  async deleteRefreshToken(
    refreshToken: string,
  ): Promise<IRefreshJwtToken | null> {
    const token = await this.orm.token.delete({
      where: {
        token: refreshToken,
      },
    });

    if (!token) return null;

    return RefreshTokenMapper.toDomain(token);
  }
}
