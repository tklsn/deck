import OpenAI from "openai";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { ChatCompletionMessageParam } from "../../types/completion";
import type { FunctionDefinition } from "../../types/tool";

export const LLM_TIMEOUT_MS = 5 * 60 * 1000;

export abstract class BaseOpenAICompatibleAdapter
  implements LLMSEngineRepositoryPort
{
  constructor(protected readonly client: OpenAI) {}

  protected normalizeModel(model: string): string {
    return model;
  }

  async handleChat(
    messages: ChatCompletionMessageParam[],
    model: string,
  ): Promise<string> {
    const response = await this.client.chat.completions.create(
      { model: this.normalizeModel(model), messages, temperature: 1 },
      { timeout: LLM_TIMEOUT_MS },
    );
    return response.choices[0]!.message.content ?? "";
  }

  async handleChatWithTools(
    messages: ChatCompletionMessageParam[],
    model: string,
    toolDefinition: FunctionDefinition,
    _toolName: string,
  ): Promise<string> {
    const completion = await this.client.chat.completions.create(
      {
        model: this.normalizeModel(model),
        messages,
        temperature: 1,
        tools: [{ type: "function", function: toolDefinition }],
        tool_choice: "required",
      },
      { timeout: LLM_TIMEOUT_MS },
    );
    const toolCall = completion.choices[0]!.message.tool_calls?.[0];
    return toolCall?.type === "function" ? toolCall.function.arguments : "";
  }
}
