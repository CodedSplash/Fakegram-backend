import { UserLoginResultDto } from '../../../../application/dtos/Auth/userLoginResult.dto';

export const userLoginExample: UserLoginResultDto = {
  user: {
    id: 0,
    name: 'Oliver',
    username: 'username123',
    country: null,
    profilePhotoUrl: 'https://i.ibb.co/MhtSNNb/fakegram-user-avatar.jpg',
    roles: ['USER'],
    aboutMe: null,
    registrationDate: new Date(),
    isVerified: false,
    isPrivate: false,
  },
  jwt: {
    refreshToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwidXNlcm5hbWUiOiJ1c2VybmFtZTEyMyIsInJvbGVzIjpbIlVTRVIiXSwiaWF0IjoxNzIwNzk1NDYwLCJleHAiOjE3MjMzODc0NjB9.Ht3CaeNlUIX8qwyAo5DvD9uRoIA5DNc87GGIqkgveqQ',
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwidXNlcm5hbWUiOiJ1c2VybmFtZTEyMyIsInJvbGVzIjpbIlVTRVIiXSwiaWF0IjoxNzIwNzk1NDYwLCJleHAiOjE3MjA3OTcyNjB9.BxQH3rm19lzPKSM2SCngPWsTGekvi2NpgyjkbupY1y4',
  },
};
