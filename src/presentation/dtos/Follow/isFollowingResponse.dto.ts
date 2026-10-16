import { ApiProperty } from '@nestjs/swagger';

export class IsFollowingResponseDto {
  @ApiProperty()
  readonly isFollowing: boolean;

  @ApiProperty({
    enum: ['none', 'requested', 'following'],
    description: 'requested — отправлен запрос на подписку на закрытый аккаунт',
  })
  readonly status: 'none' | 'requested' | 'following';
}
