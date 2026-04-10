import type { User } from "./User";

export interface CreditsOrder {
  id?: string;
  user?: User;
  userId: string;
  credits: number;
  amount: number;
  paymentRelatedId: string;
  paymentStatus: string;
  receiptUrl?: string;
  processed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
