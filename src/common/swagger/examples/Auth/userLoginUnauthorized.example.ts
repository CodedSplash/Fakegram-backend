import { DetailedInfoErrorResponseType } from '../../../types/DetailedInfoErrorResponse.type';
import { detailedInfoErrorExample } from '../../../utils/examplesErrors.util';

export const userLoginUnauthorizedExample: DetailedInfoErrorResponseType =
  detailedInfoErrorExample(
    401,
    'Вы ввели неверные данные!',
    'Unauthorized',
    '/auth/login',
  );
