import { Gender, Role } from '@domain/User/enums/user.enum';

export const userRegistrationCreateExample = {
  user: {
    id: 'tz4a98xxat96iws9zmbrgj3a',
    displayName: 'Oliver',
    username: 'username123',
    profilePhotoUrl: 'https://i.ibb.co/MhtSNNb/fakegram-user-avatar.jpg',
    roles: [Role.USER],
    bio: null,
    createdAt: new Date(),
    isVerified: false,
    isPrivate: false,
    email: 'test@example.com',
    phoneNumber: '+7 123 456 78 90',
    dateOfBirth: new Date('2000-01-15T00:00:00.000Z'),
    gender: Gender.PREFER_NOT_TO_SAY,
    websiteUrl: 'fakegram.com/user/username123',
    isActive: false,
    emailVerified: false,
    followersCount: 0,
    followingsCount: 0,
  },
  jwt: {
    refreshToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwidXNlcm5hbWUiOiJ1c2VybmFtZTEyMyIsInJvbGVzIjpbIlVTRVIiXSwiaWF0IjoxNzIwNzk1NDYwLCJleHAiOjE3MjMzODc0NjB9.Ht3CaeNlUIX8qwyAo5DvD9uRoIA5DNc87GGIqkgveqQ',
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwidXNlcm5hbWUiOiJ1c2VybmFtZTEyMyIsInJvbGVzIjpbIlVTRVIiXSwiaWF0IjoxNzIwNzk1NDYwLCJleHAiOjE3MjA3OTcyNjB9.BxQH3rm19lzPKSM2SCngPWsTGekvi2NpgyjkbupY1y4',
  },
};
