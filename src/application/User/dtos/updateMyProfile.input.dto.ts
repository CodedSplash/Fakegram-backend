import { Gender } from '@domain/User/enums/user.enum';

// undefined — поле не меняется, null — значение очищается.
export interface UpdateMyProfileInputDto {
  readonly displayName?: string | null;
  readonly bio?: string | null;
  readonly websiteUrl?: string | null;
  readonly gender?: Gender;
  readonly isPrivate?: boolean;
}
