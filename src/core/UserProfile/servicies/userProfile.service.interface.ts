import { IUserProfile } from '../entities/userProfile.entity';

export interface IUserProfileService {
  getByUsername(username: string): Promise<IUserProfile>;

  hasUser(username: string): Promise<IUserProfile>;
}
