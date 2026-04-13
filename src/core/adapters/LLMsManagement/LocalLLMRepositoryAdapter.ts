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
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt));
      const response = await this.client.chat.completions.create(
        { model, messages, temperature: 1 },
        { timeout: LLM_TIMEOUT_MS },
      );
      const content = response.choices[0].message.content ?? "";
      if (content.trim()) return content;
    }
    return "";
  }

  async handleChatStream(
    messages: ChatCompletionMessageParam[],
    model: string,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt));
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
      if (fullContent.trim()) return fullContent;
    }
    return "";
  }

  async handleChatWithTools(
    messages: ChatCompletionMessageParam[],
    model: string,
    toolDefinition: FunctionDefinition,
    _toolName: string,
  ): Promise<string> {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt));
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

      // Caminho normal: modelo retornou tool_call com arguments
      const args =
        completion.choices[0].message.tool_calls?.[0]?.function?.arguments ??
        "";
      if (args.trim()) return args;

      // Fallback: modelo ignorou tool calling e colocou o JSON direto no content
      const text = completion.choices[0].message.content ?? "";
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return match[0];
    }
    return "";
  }
}
