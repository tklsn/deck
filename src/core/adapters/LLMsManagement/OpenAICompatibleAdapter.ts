import OpenAI from "openai";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { ChatMessage } from "../../domain/ChatMessage";
import type { FunctionDefinition } from "../../types/tool";

// Cobre o load JIT do modelo (LM Studio) + geração de modelos de raciocínio.
export const LLM_TIMEOUT_MS = 10 * 60 * 1000;
const RETRY_DELAY_MS = 2000;

/**
 * - "json_schema": resposta restrita pelo schema (LM Studio, Ollama).
 * - "tools": function calling com tool_choice obrigatório (APIs externas).
 */
export type StructuredMode = "json_schema" | "tools";

export interface OpenAICompatibleOptions {
  baseURL: string;
  apiKey: string;
  structuredMode: StructuredMode;
  defaultHeaders?: Record<string, string>;
  normalizeModel?: (model: string) => string;
}

function stripThinking(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

// Templates de chat (ex.: Qwen) exigem ao menos uma mensagem `user`.
function ensureUserTurn(
  messages: ChatMessage[],
): ChatMessage[] {
  if (messages.some((m) => m.role === "user")) return messages;
  return [
    ...messages,
    { role: "user", content: "Execute a tarefa descrita acima." },
  ];
}

// Apenas falhas transitórias. Timeout não é repetido (já são 10 min) e erro 4xx/500 de template também não.
function isTransient(error: unknown): boolean {
  if (error instanceof OpenAI.APIConnectionTimeoutError) return false;
  if (error instanceof OpenAI.APIConnectionError) return true;
  if (error instanceof OpenAI.APIError) {
    return error.status === 429 || (error.status ?? 0) >= 502;
  }
  return false;
}

export class OpenAICompatibleAdapter implements LLMSEngineRepositoryPort {
  private readonly client: OpenAI;

  constructor(private readonly options: OpenAICompatibleOptions) {
    this.client = new OpenAI({
      baseURL: options.baseURL,
      apiKey: options.apiKey,
      defaultHeaders: options.defaultHeaders,
      maxRetries: 0,
      dangerouslyAllowBrowser: true,
    });
  }

  private model(model: string): string {
    return this.options.normalizeModel?.(model) ?? model;
  }

  private async request<T>(call: () => Promise<T>): Promise<T> {
    try {
      return await call();
    } catch (error) {
      if (!isTransient(error)) throw error;
      console.warn("[LLM] falha transitória, tentando novamente:", error);
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      return call();
    }
  }

  async handleChat(
    messages: ChatMessage[],
    model: string,
  ): Promise<string> {
    const response = await this.request(() =>
      this.client.chat.completions.create(
        {
          model: this.model(model),
          messages: ensureUserTurn(messages),
          temperature: 1,
        },
        { timeout: LLM_TIMEOUT_MS },
      ),
    );
    return stripThinking(response.choices[0]?.message.content ?? "");
  }

  async handleChatWithTools(
    messages: ChatMessage[],
    model: string,
    toolDefinition: FunctionDefinition,
    _toolName: string,
  ): Promise<string> {
    const base = {
      model: this.model(model),
      messages: ensureUserTurn(messages),
      temperature: 1,
    };

    if (this.options.structuredMode === "json_schema") {
      const response = await this.request(() =>
        this.client.chat.completions.create(
          {
            ...base,
            response_format: {
              type: "json_schema",
              json_schema: {
                name: toolDefinition.name,
                schema: toolDefinition.parameters,
                strict: true,
              },
            },
          },
          { timeout: LLM_TIMEOUT_MS },
        ),
      );
      return stripThinking(response.choices[0]?.message.content ?? "");
    }

    const response = await this.request(() =>
      this.client.chat.completions.create(
        {
          ...base,
          tools: [{ type: "function", function: toolDefinition }],
          tool_choice: "required",
        },
        { timeout: LLM_TIMEOUT_MS },
      ),
    );
    const toolCall = response.choices[0]?.message.tool_calls?.[0];
    return toolCall?.type === "function" ? toolCall.function.arguments : "";
  }
}
