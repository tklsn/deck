import OpenAI from "openai";
import type {
  ChatCompletionChunk,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessage,
} from "openai/resources/chat/completions";
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

// Durante o stream, esconde tambem um <think> ainda aberto.
function visibleText(text: string): string {
  const stripped = stripThinking(text);
  const open = stripped.indexOf("<think>");
  return (open >= 0 ? stripped.slice(0, open) : stripped).trim();
}

type Params = Omit<ChatCompletionCreateParamsNonStreaming, "stream">;
type Delta = ChatCompletionChunk.Choice.Delta;

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

  private async request<T>(
    call: () => Promise<T>,
    canRetry: () => boolean = () => true,
  ): Promise<T> {
    try {
      return await call();
    } catch (error) {
      if (!isTransient(error) || !canRetry()) throw error;
      console.warn("[LLM] falha transitória, tentando novamente:", error);
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      return call();
    }
  }

  // Sem onChunk: chamada unica. Com onChunk: stream; o timeout do SDK cobre
  // so ate os headers (load JIT + prompt), depois o stream corre livre.
  private async complete(
    params: Params,
    fromMessage: (message: ChatCompletionMessage | undefined) => string,
    fromDelta: (delta: Delta) => string,
    onChunk?: (accumulated: string) => void,
  ): Promise<string> {
    if (!onChunk) {
      const response = await this.request(() =>
        this.client.chat.completions.create(params, { timeout: LLM_TIMEOUT_MS }),
      );
      return fromMessage(response.choices[0]?.message);
    }

    let started = false;
    return this.request(
      async () => {
        const stream = await this.client.chat.completions.create(
          { ...params, stream: true },
          { timeout: LLM_TIMEOUT_MS },
        );
        let accumulated = "";
        for await (const chunk of stream) {
          const piece = fromDelta(chunk.choices[0]?.delta ?? {});
          if (!piece) continue;
          started = true;
          accumulated += piece;
          onChunk(visibleText(accumulated));
        }
        return accumulated;
      },
      () => !started,
    );
  }

  async handleChat(
    messages: ChatMessage[],
    model: string,
    onChunk?: (accumulated: string) => void,
  ): Promise<string> {
    const raw = await this.complete(
      {
        model: this.model(model),
        messages: ensureUserTurn(messages),
        temperature: 1,
      },
      (m) => m?.content ?? "",
      (d) => d.content ?? "",
      onChunk,
    );
    return stripThinking(raw);
  }

  async handleChatWithTools(
    messages: ChatMessage[],
    model: string,
    toolDefinition: FunctionDefinition,
    _toolName: string,
    onChunk?: (accumulated: string) => void,
  ): Promise<string> {
    const base = {
      model: this.model(model),
      messages: ensureUserTurn(messages),
      temperature: 1,
    };

    if (this.options.structuredMode === "json_schema") {
      const raw = await this.complete(
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
        (m) => m?.content ?? "",
        (d) => d.content ?? "",
        onChunk,
      );
      return stripThinking(raw);
    }

    return this.complete(
      {
        ...base,
        tools: [{ type: "function", function: toolDefinition }],
        tool_choice: "required",
      },
      (m) => {
        const call = m?.tool_calls?.[0];
        return call?.type === "function" ? call.function.arguments : "";
      },
      (d) => d.tool_calls?.[0]?.function?.arguments ?? "",
      onChunk,
    );
  }
}
