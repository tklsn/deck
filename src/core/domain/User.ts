import type { BillingProfile } from "./BillingProfile";
import type { CreditsOrder } from "./CreditsOrder";
import type { OAuthProfile } from "./OAuthProfile";
import type { Profile } from "./Profile";

export interface User {
  id?: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
  password?: string;
  verified?: boolean;
  verifiedAt?: Date;
  profile?: Profile;
  billingProfile?: BillingProfile;
  creditsOrder?: CreditsOrder;
  userOAuth?: OAuthProfile[];
}
