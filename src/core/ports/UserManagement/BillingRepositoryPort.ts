import type { BillingProfile } from "../../domain/BillingProfile";
import type { CreditsOrder } from "../../domain/CreditsOrder";

export interface BillingRepositoryPort {
  updateUserProfile: (
    userId: string,
    profile: BillingProfile,
  ) => Promise<BillingProfile>;
  userHasCredit: (userId: string, credit: number) => Promise<boolean>;
  consumeCredit: (userId: string, credit: number) => Promise<BillingProfile>;
  addCredit: (userId: string, credit: number) => Promise<BillingProfile>;
  createOrder: (order: CreditsOrder) => Promise<CreditsOrder>;
  getOrder: (orderId: string) => Promise<CreditsOrder>;
  getOrdersByUserId: (userId: string) => Promise<CreditsOrder[]>;
  getOrderByRelatedId: (relatedId: string) => Promise<CreditsOrder>;
  updateOrder: (orderId: string, order: CreditsOrder) => Promise<CreditsOrder>;
}
