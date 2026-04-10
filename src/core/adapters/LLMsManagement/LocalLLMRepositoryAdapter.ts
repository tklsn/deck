import OpenAI from "openai";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import {
  resolveLocalLLMBaseURL,
  type LocalLLMConfig,
} from "../../services/local_llm";
import type { ChatCompletionMessageParam } from "../../types/completion";
import type { FunctionDefinition } from "../../types/tool";

const LLM_TIMEOUT_MS = 5 * 60 * 1000;

export class LocalLLMRepositoryAdapter implements LLMSEngineRepositoryPort {
  private client: OpenAI;

  constructor(config: LocalLLMConfig) {
    this.client = new OpenAI({
      baseURL: resolveLocalLLMBaseURL(config),
      apiKey: config.apiKey ?? config.provider,
      dangerouslyAllowBrowser: true,
    });
  }

  async handleChat(
    messages: ChatCompletionMessageParam[],
    model: string,
  ): Promise<string> {
    const response = await this.client.chat.completions.create(
      { model, messages, temperature: 1 },
      { timeout: LLM_TIMEOUT_MS },
    );
    return response.choices[0].message.content ?? "";
  }

  async handleChatStream(
    messages: ChatCompletionMessageParam[],
    model: string,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    const stream = await this.client.chat.completions.create(
      { model, messages, temperature: 1, stream: true },
      { timeout: LLM_TIMEOUT_MS },
    );
    let fullContent = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content ?? "";
      if (content) {
        onChunk(content);
        fullContent += content;
      }
    }
    return fullContent;
  }

  async handleChatWithTools(
    messages: ChatCompletionMessageParam[],
    model: string,
    toolDefinition: FunctionDefinition,
    _toolName: string,
  ): Promise<string> {
    const completion = await this.client.chat.completions.create(
      {
        model,
        messages,
        temperature: 1,
        tools: [{ type: "function", function: toolDefinition }],
        tool_choice: "required",
      },
      { timeout: LLM_TIMEOUT_MS },
    );
    return (
      completion.choices[0].message.tool_calls?.[0]?.function?.arguments ?? ""
    );
  }
}
