import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '@presentation/constants/validation.constants';
import { DeleteAccountInputDto } from '@application/User/dtos/deleteAccount.input.dto';
import { DeactivateAccountInputDto } from '@application/User/dtos/deactivateAccount.input.dto';
import {
  fieldNotEmptyMessage,
  fieldTypeMessage,
  generateMaxLengthMessage,
  generateMinLengthMessage,
} from '@presentation/utils/validationMessages.util';

// Подтверждение опасного действия текущим паролем (удаление, деактивация)
export class ConfirmPasswordDto
  implements DeleteAccountInputDto, DeactivateAccountInputDto
{
  @ApiProperty({
    minLength: MIN_PASSWORD_LENGTH,
    maxLength: MAX_PASSWORD_LENGTH,
    example: 'password123',
  })
  @IsNotEmpty({ message: fieldNotEmptyMessage('currentPassword') })
  @IsString({ message: fieldTypeMessage('currentPassword', 'строкой') })
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: generateMinLengthMessage('currentPassword', MIN_PASSWORD_LENGTH),
  })
  @MaxLength(MAX_PASSWORD_LENGTH, {
    message: generateMaxLengthMessage('currentPassword', MAX_PASSWORD_LENGTH),
  })
  readonly currentPassword: string;
}
