import OpenAI from "openai";
import type {
  LocalLLMModel,
  LocalLLMModelsPort,
} from "../../ports/UtilsAndLLMs/LocalLLMModelsPort";
import {
  resolveLocalLLMBaseURL,
  type LocalLLMConfig,
} from "../../services/local_llm";

export class LocalLLMModelsAdapter implements LocalLLMModelsPort {
  private client: OpenAI;

  constructor(config: LocalLLMConfig) {
    this.client = new OpenAI({
      baseURL: resolveLocalLLMBaseURL(config),
      apiKey: config.apiKey ?? config.provider,
      dangerouslyAllowBrowser: true,
    });
  }

  async listModels(): Promise<LocalLLMModel[]> {
    const response = await this.client.models.list();
    return response.data.map((m) => ({ id: m.id, name: m.id }));
  }
}
