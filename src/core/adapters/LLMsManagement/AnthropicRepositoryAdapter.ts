import OpenAI from "openai";
import { EXTERNAL_LLM_DEFAULTS } from "../../services/external_llm";
import { BaseOpenAICompatibleAdapter } from "./BaseOpenAICompatibleAdapter";

export class AnthropicRepositoryAdapter extends BaseOpenAICompatibleAdapter {
  constructor(apiKey: string) {
    super(
      new OpenAI({
        baseURL: EXTERNAL_LLM_DEFAULTS.anthropic.url,
        apiKey,
        defaultHeaders: { "anthropic-version": "2023-06-01" },
        dangerouslyAllowBrowser: true,
      }),
    );
  }
}
