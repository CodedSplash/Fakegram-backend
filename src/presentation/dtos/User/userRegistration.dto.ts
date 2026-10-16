import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  MAX_PASSWORD_LENGTH,
  MAX_PHONE_NUMBER_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_AGE,
  MIN_PASSWORD_LENGTH,
  MIN_PHONE_NUMBER_LENGTH,
  MIN_USERNAME_LENGTH,
} from '@presentation/constants/validation.constants';
import { IsOlderThan } from '@presentation/decorators/isOlderThan.decorator';
import { RegistrationInputDto } from '@application/Auth/dtos/registration.input.dto';
import { userRegistrationRequestExample } from '@presentation/swagger/examples/Auth/userRegistrationRequest.example';
import {
  fieldTypeMessage,
  generateMinLengthMessage,
  generateMaxLengthMessage,
  fieldNotEmptyMessage,
} from '@presentation/utils/validationMessages.util';

export class UserRegistrationDto implements RegistrationInputDto {
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
    minLength: MIN_PHONE_NUMBER_LENGTH,
    maxLength: MAX_PHONE_NUMBER_LENGTH,
    example: userRegistrationRequestExample.phoneNumber,
  })
  @IsNotEmpty({ message: fieldNotEmptyMessage('phoneNumber') })
  @IsString({ message: fieldTypeMessage('phoneNumber', 'строкой') })
  @MinLength(MIN_PHONE_NUMBER_LENGTH, {
    message: generateMinLengthMessage('phoneNumber', MIN_PHONE_NUMBER_LENGTH),
  })
  @MaxLength(MAX_PHONE_NUMBER_LENGTH, {
    message: generateMaxLengthMessage('phoneNumber', MAX_PHONE_NUMBER_LENGTH),
  })
  @IsPhoneNumber(undefined, { message: 'Номер телефона введён некорректно.' })
  readonly phoneNumber: string;

  @ApiProperty({
    description: `Полная дата рождения пользователя в формате ISO 8601. Пользователю должно быть не менее ${MIN_AGE} лет`,
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
