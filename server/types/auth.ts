export type TokenType = {
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
  _id: string;
  email: string;
  isActivated: boolean;
};

export type LoginResponse = {
  user: UserDtoType;
  accessToken: string;
  refreshToken: string;
};