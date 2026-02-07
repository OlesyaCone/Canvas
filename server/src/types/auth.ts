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
};

export type UserDtoType = {
  id: string;
  email: string;
  isActivated: boolean;
};

export type LoginResponse = {
  user: UserDtoType;
  accessToken: string;
  refreshToken: string;
};