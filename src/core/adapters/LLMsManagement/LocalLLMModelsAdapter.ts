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
  private config: LocalLLMConfig;
  private client: OpenAI;

  constructor(config: LocalLLMConfig) {
    this.config = config;
    this.client = new OpenAI({
      baseURL: resolveLocalLLMBaseURL(config),
      apiKey: config.apiKey ?? config.provider,
      dangerouslyAllowBrowser: true,
    });
  }

  async listModels(): Promise<LocalLLMModel[]> {
    if (this.config.provider === "foundry") {
      return this._listFoundryModels();
    }
    const response = await this.client.models.list();
    return response.data.map((m) => ({ id: m.id, name: m.id }));
  }

  private async _listFoundryModels(): Promise<LocalLLMModel[]> {
    const root = resolveLocalLLMBaseURL(this.config).replace(/\/v1\/?$/, "");
    const res = await fetch(`${root}/openai/models`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ids = (await res.json()) as string[];
    return ids.map((id) => ({ id, name: id }));
  }
}
