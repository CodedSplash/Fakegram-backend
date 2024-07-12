import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_AGE,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from '../../../common/constants/validation.constants';
import { IsOlderThan } from '../../../common/decorators/isOlderThan.decorator';
import { userRegistrationRequestExample } from '../../../common/swagger/examples/Auth/userRegistrationRequest.example';
import {
  fieldNotEmptyMessage,
  fieldTypeMessage,
  generateMaxLengthMessage,
  generateMinLengthMessage,
} from '../../../common/utils/validationMessages.util';

export class UserRegistrationDto {
  @ApiProperty({
    required: false,
    minLength: MIN_NAME_LENGTH,
    maxLength: MAX_NAME_LENGTH,
    example: userRegistrationRequestExample.name,
  })
  @IsOptional()
  @IsString({ message: fieldTypeMessage('name', 'строкой') })
  @MinLength(MIN_NAME_LENGTH, {
    message: generateMinLengthMessage('name', MIN_NAME_LENGTH),
  })
  @MaxLength(MAX_NAME_LENGTH, {
    message: generateMaxLengthMessage('name', MAX_NAME_LENGTH),
  })
  readonly name?: string;

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
    example: userRegistrationRequestExample.email,
  })
  @IsNotEmpty({ message: fieldNotEmptyMessage('email') })
  @IsEmail({}, { message: fieldTypeMessage('email', 'почтой') })
  readonly email: string;

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

  @ApiProperty({
    description:
      'Полная дата рождения пользователя в формате ISO 8601. Пользователю должно быть не менее 13 лет',
    example: userRegistrationRequestExample.fullDateBirth,
  })
  @IsNotEmpty({ message: fieldNotEmptyMessage('fullDateBirth') })
  @IsDateString(
    {},
    {
      message: fieldTypeMessage(
        'fullDateBirth',
        'строковой датой формата ISO8601',
      ),
    },
  )
  @IsOlderThan(MIN_AGE, {
    message: `Пользователю должно быть не менее ${MIN_AGE} лет`,
  })
  readonly fullDateBirth: string;
}
