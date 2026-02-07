import { UserDtoType } from './auth'; 
declare global {
  namespace Express {
    export interface Request {  
      user?: UserDtoType; 
      cookies?: {
        refreshToken?: string;
        [key: string]: string | undefined;
      };
    }
  }
}