import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import {
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from '@presentation/constants/validation.constants';
import { userRegistrationRequestExample } from '@presentation/swagger/examples/Auth/userRegistrationRequest.example';
import {
  fieldNotEmptyMessage,
  fieldTypeMessage,
  generateMinLengthMessage,
  generateMaxLengthMessage,
} from '@presentation/utils/validationMessages.util';

export class UserLoginDto {
  @ApiProperty({
    minLength: MIN_USERNAME_LENGTH,
    maxLength: MAX_USERNAME_LENGTH,
    example: userRegistrationRequestExample.username,
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
    example: userRegistrationRequestExample.password,
  })
  @IsNotEmpty({ message: fieldNotEmptyMessage('password') })
  @IsString({ message: fieldTypeMessage('password', 'строкой') })
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: generateMinLengthMessage('password', MIN_PASSWORD_LENGTH),
  })
  @MaxLength(MAX_PASSWORD_LENGTH, {
    message: generateMaxLengthMessage('password', MAX_PASSWORD_LENGTH),
  })
  readonly password: string;
}
