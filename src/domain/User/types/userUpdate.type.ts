import { Gender } from '@domain/User/enums/user.enum';

// Частичное обновление профиля: undefined — колонка не трогается,
// null — значение очищается
export interface UserProfilePatch {
  displayName?: string | null;
  bio?: string | null;
  websiteUrl?: string | null;
  gender?: Gender;
  isPrivate?: boolean;
}

export interface UserLoginRecord {
  lastLoginAt: Date;
  // Перехеширование применяется, только если хеш в хранилище не изменился
  // с момента чтения (иначе затёрли бы конкурентную смену пароля)
  passwordRehash?: { previousHash: string; newHash: string };
}
