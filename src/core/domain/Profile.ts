import type { User } from "./User";

export interface Profile {
  id?: string;
  user?: User;
  userId?: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
