export interface User {
  _id: string;
  email: string;
  displayName: string;
  avatar?: string;
  provider: string;
  isActivated: boolean;
}