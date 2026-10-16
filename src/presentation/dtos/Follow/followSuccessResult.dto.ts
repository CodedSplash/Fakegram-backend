import { ApiProperty } from '@nestjs/swagger';

export class FollowSuccessResultDto {
  @ApiProperty()
  isSuccess: boolean;

  @ApiProperty({
    enum: ['following', 'requested'],
    description:
      'following — подписка оформлена; requested — закрытый аккаунт, отправлен запрос',
  })
  status: 'following' | 'requested';

  @ApiProperty()
  message: string;
}
