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

export type AuthenticatedRequest = Request & {
  user?: UserType;
  headers: Request['headers'] & {
    authorization?: string;
  };
};