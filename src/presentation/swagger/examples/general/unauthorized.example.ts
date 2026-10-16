import { detailedInfoErrorExample } from '@presentation/utils/examplesErrors.util';

export const unauthorizedExample = (path: string) => {
  return detailedInfoErrorExample(
    401,
    'Токен не найден!',
    'Unauthorized',
    path,
  );
};
