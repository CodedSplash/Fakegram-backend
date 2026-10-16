import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '@presentation/constants/validation.constants';
import { ChangeEmailInputDto } from '@application/User/dtos/changeEmail.input.dto';
import { changeEmailRequestExample } from '@presentation/swagger/examples/User/account.example';
import {
  fieldNotEmptyMessage,
  fieldTypeMessage,
  generateMaxLengthMessage,
  generateMinLengthMessage,
} from '@presentation/utils/validationMessages.util';

export class ChangeEmailDto implements ChangeEmailInputDto {
  @ApiProperty({
    example: changeEmailRequestExample.email,
  })
  @IsNotEmpty({ message: fieldNotEmptyMessage('email') })
  @IsEmail({}, { message: fieldTypeMessage('email', 'почтой') })
  readonly email: string;

  @ApiProperty({
    minLength: MIN_PASSWORD_LENGTH,
    maxLength: MAX_PASSWORD_LENGTH,
    example: changeEmailRequestExample.currentPassword,
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
