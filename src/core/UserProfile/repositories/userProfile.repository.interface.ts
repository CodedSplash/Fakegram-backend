import { IUserProfile } from '../entities/userProfile.entity';

export interface IUserProfileRepository {
  getByUsername(username: string): Promise<IUserProfile | null>;
}
