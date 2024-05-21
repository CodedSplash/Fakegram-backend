import { Module } from '@nestjs/common';
import { PrismaService } from './orm/prisma.service';

@Module({
  providers: [PrismaService],
})
export class DbModule {}
