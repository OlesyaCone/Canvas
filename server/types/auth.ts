export type TokenType = {
    user: string;
    refreshToken: string;
};

export type UserType = {
    email: string;
    password: string;
    isActivated: boolean;
    activationLink?: string;
};