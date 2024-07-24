import { detailedInfoErrorExample } from '../../../utils/examplesErrors.util';

export const internalServerErrorExample = (path: string) => {
  return detailedInfoErrorExample(
    500,
    'Ошибка на стороне сервера',
    'Internal Server Error',
    path,
  );
};
