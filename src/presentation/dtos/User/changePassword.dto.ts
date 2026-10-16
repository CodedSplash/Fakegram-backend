import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '@presentation/constants/validation.constants';
import { ChangePasswordInputDto } from '@application/User/dtos/changePassword.input.dto';
import { changePasswordRequestExample } from '@presentation/swagger/examples/User/account.example';
import {
  fieldNotEmptyMessage,
  fieldTypeMessage,
  generateMaxLengthMessage,
  generateMinLengthMessage,
} from '@presentation/utils/validationMessages.util';

export class ChangePasswordDto implements ChangePasswordInputDto {
  @ApiProperty({
    minLength: MIN_PASSWORD_LENGTH,
    maxLength: MAX_PASSWORD_LENGTH,
    example: changePasswordRequestExample.currentPassword,
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

  @ApiProperty({
    minLength: MIN_PASSWORD_LENGTH,
    maxLength: MAX_PASSWORD_LENGTH,
    description: 'Должен отличаться от текущего пароля',
    example: changePasswordRequestExample.newPassword,
  })
  @IsNotEmpty({ message: fieldNotEmptyMessage('newPassword') })
  @IsString({ message: fieldTypeMessage('newPassword', 'строкой') })
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: generateMinLengthMessage('newPassword', MIN_PASSWORD_LENGTH),
  })
  @MaxLength(MAX_PASSWORD_LENGTH, {
    message: generateMaxLengthMessage('newPassword', MAX_PASSWORD_LENGTH),
  })
  readonly newPassword: string;
}
