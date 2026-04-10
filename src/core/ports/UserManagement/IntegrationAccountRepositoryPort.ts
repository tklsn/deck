import type { IntegrationAccount } from "../../domain/IntegrationAccount";

export interface IntegrationAccountRepositoryPort {
  createIntegration: (
    userId: string,
    integration: IntegrationAccount,
  ) => Promise<IntegrationAccount>;
  listIntegrationsByUserId: (userId: string) => Promise<IntegrationAccount>;
}
