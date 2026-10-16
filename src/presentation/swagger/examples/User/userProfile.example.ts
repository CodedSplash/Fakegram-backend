import { detailedInfoErrorExample } from '@presentation/utils/examplesErrors.util';

export const userProfilePathExample = '/user/test_1/profile';

export const userProfileResponseExample = {
  id: 'xmf1qdx7slcpic0nqhjufpuh',
  username: 'test_1',
  displayName: 'Test User',
  bio: 'Пишу код и фотографирую закаты.',
  profilePhotoUrl: null,
  websiteUrl: 'https://example.com',
  isVerified: false,
  isPrivate: false,
  followersCount: 42,
  followingsCount: 17,
  createdAt: '2026-01-17T16:05:43.000Z',
};

export const userProfileBadRequestExample = detailedInfoErrorExample(
  400,
  'Username has an incorrect format.',
  'Bad Request',
  '/user/te/profile',
);

export const userProfileNotFoundExample = detailedInfoErrorExample(
  404,
  'Пользователь не найден!',
  'Not Found',
  userProfilePathExample,
);
