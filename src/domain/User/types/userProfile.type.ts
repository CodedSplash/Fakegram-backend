export interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  profilePhotoUrl: string | null;
  websiteUrl: string | null;
  isVerified: boolean;
  isPrivate: boolean;
  followersCount: number;
  followingsCount: number;
  createdAt: Date;
}
