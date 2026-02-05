import { UserType } from './auth';

declare module 'express' {
  export interface Request {  
    user?: UserType;
    cookies?: {
      refreshToken?: string;
      [key: string]: string | undefined;
    };
  }
}