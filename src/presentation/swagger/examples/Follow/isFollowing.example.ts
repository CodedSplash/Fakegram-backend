import { validationErrorExample } from '@presentation/utils/examplesErrors.util';
import { IsFollowingResponseDto } from '@presentation/dtos/Follow/isFollowingResponse.dto';

export const isFollowingPathExample =
  '/user/xmf1qdx7slcpic0nqhjufpuh/is_following';

export const isFollowingResponseExample: IsFollowingResponseDto = {
  isFollowing: true,
  status: 'following',
};

export const isFollowingBadRequestExample = validationErrorExample(
  400,
  ['The Cuid has an incorrect format.'],
  'Bad Request',
  '/user/123/is_following',
);
