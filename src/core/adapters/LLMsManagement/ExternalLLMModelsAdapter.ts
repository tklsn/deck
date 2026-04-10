import type {
  LocalLLMModel,
  LocalLLMModelsPort,
} from "../../ports/UtilsAndLLMs/LocalLLMModelsPort";
import {
  EXTERNAL_LLM_DEFAULTS,
  type ExternalLLMProvider,
} from "../../services/external_llm";

interface OpenAIModelsResponse {
  data: Array<{ id: string }>;
}

interface AnthropicModelsResponse {
  data: Array<{ id: string; display_name?: string }>;
}

async function mainProcessGet<T>(url: string, headers: Record<string, string>): Promise<T> {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export class ExternalLLMModelsAdapter implements LocalLLMModelsPort {
  private provider: ExternalLLMProvider;
  private apiKey: string;

  constructor(provider: ExternalLLMProvider, apiKey: string) {
    this.provider = provider;
    this.apiKey = apiKey;
  }

  async listModels(): Promise<LocalLLMModel[]> {
    if (this.provider === "anthropic") {
      return this._listAnthropicModels();
    }
    return this._listOpenAICompatibleModels();
  }

  private async _listOpenAICompatibleModels(): Promise<LocalLLMModel[]> {
    const url = `${EXTERNAL_LLM_DEFAULTS[this.provider].url}models`;
    const data = await mainProcessGet<OpenAIModelsResponse>(url, {
      Authorization: `Bearer ${this.apiKey}`,
    });
    return data.data.map((m) => ({ id: m.id, name: m.id }));
  }

  private async _listAnthropicModels(): Promise<LocalLLMModel[]> {
    const data = await mainProcessGet<AnthropicModelsResponse>(
      "https://api.anthropic.com/v1/models",
      {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
    );
    return data.data.map((m) => ({ id: m.id, name: m.display_name ?? m.id }));
  }
}
