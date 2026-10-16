import { ValidationError } from '@domain/common/errors/domain.error';
import { Gender, Role } from '@domain/User/enums/user.enum';
import { DateOfBirthVO } from '@domain/User/value-objects/dateOfBirth.vo';
import { EmailVO } from '@domain/User/value-objects/email.vo';
import { PhoneNumberVO } from '@domain/User/value-objects/phoneNumber.vo';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { UsernameVO } from '@domain/User/value-objects/username.vo';

// Совпадают с ограничениями колонок в БД.
export const MAX_DISPLAY_NAME_LENGTH = 30;
export const MAX_BIO_LENGTH = 150;
export const MAX_WEBSITE_URL_LENGTH = 200;

// Пустая строка (после trim) или null — значение очищается.
const normalizeOptionalText = (value?: string | null): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export class User {
  private _id: UserIdVO;
  private _username: UsernameVO;
  private _email: EmailVO;
  private _passwordHash: string;
  private _phoneNumber: PhoneNumberVO;
  private _displayName?: string;
  private _bio?: string;
  private _profilePhotoUrl?: string;
  private _dateOfBirth: DateOfBirthVO;
  private _gender?: Gender;
  private _websiteUrl?: string;
  private _roles: Role[];
  private _isVerified: boolean;
  private _isPrivate: boolean;
  private _isActive: boolean;
  private _emailVerified: boolean;
  private _followersCount: number;
  private _followingsCount: number;
  private _lastLoginAt?: Date;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(user: {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    phoneNumber: string;
    displayName?: string;
    bio?: string;
    profilePhotoUrl?: string;
    dateOfBirth: Date;
    gender?: Gender;
    websiteUrl?: string;
    roles?: Role[];
    isVerified?: boolean;
    isPrivate?: boolean;
    isActive?: boolean;
    emailVerified?: boolean;
    followersCount?: number;
    followingsCount?: number;
    lastLoginAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = new UserIdVO(user.id);
    this._username = new UsernameVO(user.username);
    this._email = new EmailVO(user.email);
    this._passwordHash = user.passwordHash;
    this._phoneNumber = new PhoneNumberVO(user.phoneNumber);
    this._displayName = user?.displayName ? user.displayName : undefined;
    this._bio = user?.bio ? user.bio : undefined;
    this._profilePhotoUrl = user?.profilePhotoUrl
      ? user.profilePhotoUrl
      : undefined;
    this._dateOfBirth = new DateOfBirthVO(user.dateOfBirth);
    this._gender = user?.gender ? user.gender : Gender.PREFER_NOT_TO_SAY;
    this._websiteUrl = user?.websiteUrl ? user.websiteUrl : undefined;
    this._roles = user?.roles ? user.roles : [Role.USER];
    this._isVerified = user?.isVerified ? user.isVerified : false;
    this._isPrivate = user?.isPrivate ? user.isPrivate : false;
    this._isActive = user?.isActive ?? true;
    this._emailVerified = user?.emailVerified ? user.emailVerified : false;
    this._followersCount = user?.followersCount ? user.followersCount : 0;
    this._followingsCount = user?.followingsCount ? user.followingsCount : 0;
    // undefined — новый пользователь (вход сразу после регистрации),
    // null из БД — ещё не входил, дату не выдумываем.
    this._lastLoginAt =
      user?.lastLoginAt === undefined
        ? new Date()
        : (user.lastLoginAt ?? undefined);
    this._createdAt = user?.createdAt ? user.createdAt : new Date();
    this._updatedAt = user?.updatedAt ? user.updatedAt : new Date();
  }

  changeUsername(newUsername: string) {
    this._username = new UsernameVO(newUsername);
    this._updatedAt = new Date();
  }

  changeEmail(newEmail: string) {
    this._email = new EmailVO(newEmail);
    this._emailVerified = false;
    this._updatedAt = new Date();
  }

  changePasswordHash(newPasswordHash: string) {
    this._passwordHash = newPasswordHash;
    this._updatedAt = new Date();
  }

  changePhoneNumber(newPhoneNumber: string) {
    this._phoneNumber = new PhoneNumberVO(newPhoneNumber);
    this._updatedAt = new Date();
  }

  changeDateOfBirth(newDateOfBirth: Date) {
    this._dateOfBirth = new DateOfBirthVO(newDateOfBirth);
    this._updatedAt = new Date();
  }

  // Отображаемое имя не уникально и не влияет на верификацию.
  changeDisplayName(newDisplayName: string | null) {
    const displayName = normalizeOptionalText(newDisplayName);

    if (displayName && displayName.length > MAX_DISPLAY_NAME_LENGTH) {
      throw new ValidationError(
        `Имя должно содержать не более ${MAX_DISPLAY_NAME_LENGTH} символов.`,
      );
    }

    this._displayName = displayName;
    this._updatedAt = new Date();
  }

  changeBio(newBio: string | null) {
    const bio = normalizeOptionalText(newBio);

    if (bio && bio.length > MAX_BIO_LENGTH) {
      throw new ValidationError(
        `Описание профиля должно содержать не более ${MAX_BIO_LENGTH} символов.`,
      );
    }

    this._bio = bio;
    this._updatedAt = new Date();
  }

  changeProfilePhotoUrl(newProfilePhotoUrl: string) {
    try {
      new URL(newProfilePhotoUrl);
      this._profilePhotoUrl = newProfilePhotoUrl;
      this._updatedAt = new Date();
    } catch {
      throw new ValidationError('Profile photo url incorrect!');
    }
  }

  changeGender(newGender: Gender) {
    this._gender = newGender;
    this._updatedAt = new Date();
  }

  changeWebsiteUrl(newWebsiteUrl: string | null) {
    const websiteUrl = normalizeOptionalText(newWebsiteUrl);

    if (websiteUrl && !this.isValidWebsiteUrl(websiteUrl)) {
      throw new ValidationError('Некорректная ссылка на сайт.');
    }

    this._websiteUrl = websiteUrl;
    this._updatedAt = new Date();
  }

  private isValidWebsiteUrl(url: string): boolean {
    if (url.length > MAX_WEBSITE_URL_LENGTH) return false;

    try {
      const { protocol } = new URL(url);
      return protocol === 'http:' || protocol === 'https:';
    } catch {
      return false;
    }
  }

  verify() {
    this._isVerified = true;
    this._emailVerified = true;
  }

  privateProfile() {
    this._isPrivate = true;
    this._updatedAt = new Date();
  }

  publicProfile() {
    this._isPrivate = false;
    this._updatedAt = new Date();
  }

  // Деактивированный аккаунт скрыт от всех; повторный вход восстанавливает его
  deactivate() {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  activate() {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  private _hasRole(role: Role) {
    return this._roles.includes(role);
  }

  addRole(role: Role) {
    if (!this._hasRole(role)) {
      this._roles.push(role);
    }
  }

  removeRole(role: Role) {
    this._roles = this._roles.filter((r) => r !== role);
  }

  updateLastLogin() {
    this._lastLoginAt = new Date();
  }

  get id() {
    return this._id;
  }
  get username() {
    return this._username;
  }
  get email() {
    return this._email;
  }
  get passwordHash() {
    return this._passwordHash;
  }
  get phoneNumber() {
    return this._phoneNumber;
  }
  get displayName() {
    return this?._displayName || null;
  }
  get bio() {
    return this?._bio || null;
  }
  get profilePhotoUrl() {
    return this?._profilePhotoUrl || null;
  }
  get dateOfBirth() {
    return this._dateOfBirth;
  }
  get gender() {
    return this?._gender || null;
  }
  get websiteUrl() {
    return this?._websiteUrl || null;
  }
  get roles() {
    return [...this._roles];
  }
  get isVerified() {
    return this._isVerified;
  }
  get isPrivate() {
    return this._isPrivate;
  }
  get isActive() {
    return this._isActive;
  }
  get emailVerified() {
    return this._emailVerified;
  }
  get followersCount() {
    return this._followersCount;
  }
  get followingsCount() {
    return this._followingsCount;
  }
  get lastLoginAt() {
    return this?._lastLoginAt || null;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }
}
