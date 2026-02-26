export type TokenDbType = {
  user: string;
  refreshToken: string;
  _id?: string;
};

export type TokenResponseType = {
  user: string;
  refreshToken: string;
  accessToken: string;
};

export type UserType = {
  email: string;
  password: string;
  isActivated: boolean;
  activationLink?: string;
  googleId?: string;
  displayName?: string;
  avatar?: string;
  provider: 'local' | 'google';
};

export type UserDtoType = {
  id: string;
  email: string;
  isActivated: boolean;
  displayName?: string;
  avatar?: string;
  provider: 'local' | 'google';
};

export type LoginResponse = {
  user: UserDtoType;
  accessToken: string;
  refreshToken: string;
};

export type GoogleProfileType = {
  id: string;
  displayName: string;
  emails: Array<{ value: string; verified: boolean }>;
  photos: Array<{ value: string }>;
  provider: string;
  _json: {
    sub: string;
    email: string;
    email_verified: boolean;
    name: string;
    picture: string;
    given_name: string;
    family_name: string;
  };
};

export type GoogleAuthResponse = LoginResponse & {
  isNewUser: boolean;
};