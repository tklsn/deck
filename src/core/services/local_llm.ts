export const LOCAL_LLM_DEFAULTS = {
  ollama: { url: "http://localhost:11434/v1/", label: "Ollama" },
  lmstudio: { url: "http://localhost:1234/v1/", label: "LM Studio" },
  foundry: { url: "http://localhost:5272/v1/", label: "Foundry Local" },
} as const;

export type LocalLLMProvider = keyof typeof LOCAL_LLM_DEFAULTS;

export type LocalLLMToolCallStrategy = "tool_calling" | "structured_output" | "auto";

export interface LocalLLMConfig {
  provider: LocalLLMProvider;
  baseURL?: string;
  apiKey?: string;
  toolCallStrategy?: LocalLLMToolCallStrategy;
  maxContextChars?: number;
}

export function resolveLocalLLMBaseURL(config: LocalLLMConfig): string {
  return config.baseURL ?? LOCAL_LLM_DEFAULTS[config.provider].url;
}
