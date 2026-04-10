/**
 * Feature flags — controlados por variáveis de ambiente (prefixo VITE_FEATURE_).
 * Para ativar localmente, adicione ao .env:
 *   VITE_FEATURE_THE_DECK=true
 */
export const flags = {
  theDeck: import.meta.env.VITE_FEATURE_THE_DECK === "true",
} as const;

export const appName = flags.theDeck ? "D.E.C.K." : "SofIA Desktop";
