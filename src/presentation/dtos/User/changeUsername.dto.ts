import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import {
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from '@presentation/constants/validation.constants';
import { ChangeUsernameInputDto } from '@application/User/dtos/changeUsername.input.dto';
import { changeUsernameRequestExample } from '@presentation/swagger/examples/User/account.example';
import {
  fieldNotEmptyMessage,
  fieldTypeMessage,
  generateMaxLengthMessage,
  generateMinLengthMessage,
} from '@presentation/utils/validationMessages.util';

export class ChangeUsernameDto implements ChangeUsernameInputDto {
  @ApiProperty({
    minLength: MIN_USERNAME_LENGTH,
    maxLength: MAX_USERNAME_LENGTH,
    example: changeUsernameRequestExample.username,
  })
  @IsNotEmpty({ message: fieldNotEmptyMessage('username') })
  @IsString({ message: fieldTypeMessage('username', 'строкой') })
  @MinLength(MIN_USERNAME_LENGTH, {
    message: generateMinLengthMessage('username', MIN_USERNAME_LENGTH),
  })
  @MaxLength(MAX_USERNAME_LENGTH, {
    message: generateMaxLengthMessage('username', MAX_USERNAME_LENGTH),
  })
  readonly username: string;

  @ApiProperty({
    minLength: MIN_PASSWORD_LENGTH,
    maxLength: MAX_PASSWORD_LENGTH,
    example: changeUsernameRequestExample.currentPassword,
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
