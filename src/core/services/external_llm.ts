export const EXTERNAL_LLM_DEFAULTS = {
  openai: { url: "https://api.openai.com/v1/", label: "OpenAI" },
  gemini: {
    url: "https://generativelanguage.googleapis.com/v1beta/openai/",
    label: "Google Gemini",
  },
  anthropic: { url: "https://api.anthropic.com/v1/", label: "Anthropic" },
  openrouter: { url: "https://openrouter.ai/api/v1/", label: "OpenRouter" },
} as const;

export type ExternalLLMProvider = keyof typeof EXTERNAL_LLM_DEFAULTS;
