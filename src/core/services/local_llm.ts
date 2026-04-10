export const LOCAL_LLM_DEFAULTS = {
  ollama: { url: "http://localhost:11434/v1/", label: "Ollama" },
  lmstudio: { url: "http://localhost:1234/v1/", label: "LM Studio" },
} as const;

export type LocalLLMProvider = keyof typeof LOCAL_LLM_DEFAULTS;

export interface LocalLLMConfig {
  provider: LocalLLMProvider;
  baseURL?: string;
  apiKey?: string;
}

export function resolveLocalLLMBaseURL(config: LocalLLMConfig): string {
  return config.baseURL ?? LOCAL_LLM_DEFAULTS[config.provider].url;
}
