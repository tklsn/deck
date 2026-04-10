import type { User } from "./User";

export interface BillingProfile {
  id?: string;
  user?: User;
  userId?: string;
  credits: number;
  createdAt?: Date;
  updatedAt?: Date;
}
