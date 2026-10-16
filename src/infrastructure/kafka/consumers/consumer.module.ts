import { Module } from '@nestjs/common';
import { KafkaModule } from '@infrastructure/kafka/kafka.module';
import { ApplicationModule } from '@application/application.module';
import { FollowConsumer } from '@infrastructure/kafka/consumers/Follow/follow.consumer';
import { DeadLetterPublisher } from '@infrastructure/kafka/services/deadLetter.publisher';

@Module({
  imports: [ApplicationModule, KafkaModule.register()],
  providers: [FollowConsumer, DeadLetterPublisher],
})
export class ConsumerModule {}
