declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        email: string;
        username: string;
        avatar: string;
        provider: string;
        isVerified: boolean;
      };
    }
  }
}

export {};
