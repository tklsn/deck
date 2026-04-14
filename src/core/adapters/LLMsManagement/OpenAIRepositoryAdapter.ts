import OpenAI from "openai";
import { EXTERNAL_LLM_DEFAULTS } from "../../services/external_llm";
import { BaseOpenAICompatibleAdapter } from "./BaseOpenAICompatibleAdapter";

export class OpenAIRepositoryAdapter extends BaseOpenAICompatibleAdapter {
  constructor(apiKey: string) {
    super(
      new OpenAI({
        baseURL: EXTERNAL_LLM_DEFAULTS.openai.url,
        apiKey,
        dangerouslyAllowBrowser: true,
      }),
    );
  }

  protected normalizeModel(model: string): string {
    return model.replace("openai/", "");
  }
}
