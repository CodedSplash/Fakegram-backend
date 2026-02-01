import { DetailedInfoErrorResponseType } from '@presentation/types/DetailedInfoErrorResponse.type';
import { detailedInfoErrorExample } from '@presentation/utils/examplesErrors.util';

export const userLoginUnauthorizedExample: DetailedInfoErrorResponseType =
  detailedInfoErrorExample(
    401,
    'Вы ввели неверные данные!',
    'Unauthorized',
    '/auth/login',
  );
