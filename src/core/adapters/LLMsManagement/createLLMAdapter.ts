import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import { EXTERNAL_LLM_DEFAULTS } from "./externalLLMDefaults";
import { LOCAL_LLM_DEFAULTS } from "./localLLMDefaults";
import { OpenAICompatibleAdapter } from "./OpenAICompatibleAdapter";

export type LLMProvider =
  | "ollama"
  | "lmstudio"
  | "openai"
  | "anthropic"
  | "openrouter";

export function createLLMAdapter(
  provider: LLMProvider,
  apiKey: string | null,
): LLMSEngineRepositoryPort {
  switch (provider) {
    case "openai":
      return new OpenAICompatibleAdapter({
        baseURL: EXTERNAL_LLM_DEFAULTS.openai.url,
        apiKey: apiKey ?? "",
        structuredMode: "tools",
        normalizeModel: (m) => m.replace("openai/", ""),
      });
    case "anthropic":
      return new OpenAICompatibleAdapter({
        baseURL: EXTERNAL_LLM_DEFAULTS.anthropic.url,
        apiKey: apiKey ?? "",
        structuredMode: "tools",
        defaultHeaders: { "anthropic-version": "2023-06-01" },
      });
    case "openrouter":
      return new OpenAICompatibleAdapter({
        baseURL: EXTERNAL_LLM_DEFAULTS.openrouter.url,
        apiKey: apiKey ?? "",
        structuredMode: "tools",
        defaultHeaders: {
          "HTTP-Referer": "https://github.com/tklsn/deck",
          "X-Title": "Deck",
        },
      });
    default:
      return new OpenAICompatibleAdapter({
        baseURL: LOCAL_LLM_DEFAULTS[provider].url,
        apiKey: provider,
        structuredMode: "json_schema",
      });
  }
}
