import { Global, Module } from '@nestjs/common';
import { PrismaService } from './orm/prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DbModule {}
