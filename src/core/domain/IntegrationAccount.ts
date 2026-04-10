import type { IntegrationAccountProvider } from "./IntegrationAccountProvider";
import type { User } from "./User";

export interface IntegrationAccount {
  id?: string;
  provider?: IntegrationAccountProvider;
  access_token?: string;
  refresh_token?: string;
  associatedData?: object;
  user?: User;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
