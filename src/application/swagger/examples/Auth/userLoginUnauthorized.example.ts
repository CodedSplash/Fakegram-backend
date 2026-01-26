import { DetailedInfoErrorResponseType } from '@application/types/DetailedInfoErrorResponse.type';
import { detailedInfoErrorExample } from '@application/utils/examplesErrors.util';

export const userLoginUnauthorizedExample: DetailedInfoErrorResponseType =
  detailedInfoErrorExample(
    401,
    'Вы ввели неверные данные!',
    'Unauthorized',
    '/auth/login',
  );
