import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Gender } from '@domain/User/enums/user.enum';
import {
  MAX_BIO_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  MAX_WEBSITE_URL_LENGTH,
} from '@domain/User/entities/user.entity';
import { UpdateMyProfileInputDto } from '@application/User/dtos/updateMyProfile.input.dto';
import { updateMyProfileRequestExample } from '@presentation/swagger/examples/User/me.example';
import {
  fieldTypeMessage,
  generateMaxLengthMessage,
} from '@presentation/utils/validationMessages.util';

// Все поля необязательны; для текстовых null (или пустая строка) очищает значение.
// gender и isPrivate очистить нельзя, поэтому null для них — ошибка.
export class UpdateMyProfileDto implements UpdateMyProfileInputDto {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    maxLength: MAX_DISPLAY_NAME_LENGTH,
    example: updateMyProfileRequestExample.displayName,
  })
  @IsOptional()
  @IsString({ message: fieldTypeMessage('displayName', 'строкой') })
  @MaxLength(MAX_DISPLAY_NAME_LENGTH, {
    message: generateMaxLengthMessage('displayName', MAX_DISPLAY_NAME_LENGTH),
  })
  readonly displayName?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    maxLength: MAX_BIO_LENGTH,
    example: updateMyProfileRequestExample.bio,
  })
  @IsOptional()
  @IsString({ message: fieldTypeMessage('bio', 'строкой') })
  @MaxLength(MAX_BIO_LENGTH, {
    message: generateMaxLengthMessage('bio', MAX_BIO_LENGTH),
  })
  readonly bio?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    maxLength: MAX_WEBSITE_URL_LENGTH,
    example: updateMyProfileRequestExample.websiteUrl,
  })
  @IsOptional()
  @IsString({ message: fieldTypeMessage('websiteUrl', 'строкой') })
  @MaxLength(MAX_WEBSITE_URL_LENGTH, {
    message: generateMaxLengthMessage('websiteUrl', MAX_WEBSITE_URL_LENGTH),
  })
  @ValidateIf((_, value) => value !== '')
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: fieldTypeMessage('websiteUrl', 'ссылкой http(s)') },
  )
  readonly websiteUrl?: string | null;

  @ApiPropertyOptional({
    enum: Gender,
    enumName: 'Gender',
    example: updateMyProfileRequestExample.gender,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(Gender, {
    message: fieldTypeMessage('gender', `одним из: ${Object.values(Gender)}`),
  })
  readonly gender?: Gender;

  @ApiPropertyOptional({ example: updateMyProfileRequestExample.isPrivate })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean({ message: fieldTypeMessage('isPrivate', 'логическим значением') })
  readonly isPrivate?: boolean;
}
