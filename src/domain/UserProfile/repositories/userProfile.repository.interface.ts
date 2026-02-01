import { IUserProfile } from '@domain/UserProfile/entities/userProfile.entity';

export interface IUserProfileRepository {
  getByUsername(username: string): Promise<IUserProfile | null>;
}
