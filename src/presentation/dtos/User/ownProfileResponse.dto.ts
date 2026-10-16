import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@domain/User/enums/user.enum';
import { GenerateDtoParameterType } from '@presentation/types/dtoParameter.type';
import { UserProfileResponseDto } from '@presentation/dtos/User/userProfileResponse.dto';

export class OwnProfileResponseDto extends UserProfileResponseDto {
  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly phoneNumber: string;

  @ApiProperty()
  readonly dateOfBirth: Date;

  @ApiProperty({ enum: Gender, enumName: 'Gender', nullable: true })
  readonly gender: Gender | null;

  @ApiProperty()
  readonly emailVerified: boolean;

  @ApiProperty({ type: Date, nullable: true })
  readonly lastLoginAt: Date | null;

  // Явный перечень полей: хеш пароля в ответ не попадёт.
  constructor(profile: GenerateDtoParameterType<OwnProfileResponseDto>) {
    super(profile);
    this.email = profile.email;
    this.phoneNumber = profile.phoneNumber;
    this.dateOfBirth = profile.dateOfBirth;
    this.gender = profile.gender;
    this.emailVerified = profile.emailVerified;
    this.lastLoginAt = profile.lastLoginAt;
  }
}
