import { FollowSuccessResultDto } from '@presentation/dtos/Follow/followSuccessResult.dto';

export const followSuccessExample: FollowSuccessResultDto = {
  isSuccess: true,
  status: 'following',
  message: 'Вы успешно подписались на пользователя.',
};

export const followRequestedExample: FollowSuccessResultDto = {
  isSuccess: true,
  status: 'requested',
  message: 'Запрос на подписку отправлен.',
};
