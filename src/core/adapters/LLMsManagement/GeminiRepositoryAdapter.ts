import OpenAI from "openai";
import { EXTERNAL_LLM_DEFAULTS } from "../../services/external_llm";
import { BaseOpenAICompatibleAdapter } from "./BaseOpenAICompatibleAdapter";

export class GeminiRepositoryAdapter extends BaseOpenAICompatibleAdapter {
  constructor(apiKey: string) {
    super(
      new OpenAI({
        baseURL: EXTERNAL_LLM_DEFAULTS.gemini.url,
        apiKey,
        // Required for Electron's renderer process (Chromium environment).
        // NEVER use this flag in a web-facing build — proxy API calls via a backend instead.
        dangerouslyAllowBrowser: true,
      }),
    );
  }
}
