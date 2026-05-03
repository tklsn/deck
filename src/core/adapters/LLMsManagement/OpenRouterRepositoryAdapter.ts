import OpenAI from "openai";
import { EXTERNAL_LLM_DEFAULTS } from "../../services/external_llm";
import { BaseOpenAICompatibleAdapter } from "./BaseOpenAICompatibleAdapter";

export class OpenRouterRepositoryAdapter extends BaseOpenAICompatibleAdapter {
  constructor(apiKey: string) {
    super(
      new OpenAI({
        baseURL: EXTERNAL_LLM_DEFAULTS.openrouter.url,
        apiKey,
        defaultHeaders: {
          "HTTP-Referer": "https://github.com/tklsn/deck",
          "X-Title": "Deck",
        },
        dangerouslyAllowBrowser: true,
      }),
    );
  }
}
