import { Module } from '@nestjs/common';
import { DbModule } from './infrastructure/db/db.module';

@Module({
  imports: [DbModule],
})
export class AppModule {}
