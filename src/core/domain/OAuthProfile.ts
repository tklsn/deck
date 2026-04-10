import type { User } from "./User";

export interface OAuthProfile {
  id?: string;
  user?: User;
  userId?: string;
  userSub: string;
  provider: string;
  orgs?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
