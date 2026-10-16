import {
  detailedInfoErrorExample,
  validationErrorExample,
} from '@presentation/utils/examplesErrors.util';

export const unfollowBadRequestExample = validationErrorExample(
  400,
  ['Поле followingId не должно быть пустым'],
  'Bad Request',
  '/user/unfollow',
);

export const unfollowNotFoundExample = detailedInfoErrorExample(
  404,
  'Вы не подписаны на данного пользователя.',
  'Not Found',
  '/user/unfollow',
);
