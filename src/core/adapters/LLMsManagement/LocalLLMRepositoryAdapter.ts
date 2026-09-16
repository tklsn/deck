import OpenAI from "openai";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import { isStructuredToolResultAcceptable } from "../../services/artifact_generation";
import {
  resolveLocalLLMBaseURL,
  type LocalLLMConfig,
  type LocalLLMToolCallStrategy,
} from "../../services/local_llm";
import type { ChatCompletionMessageParam } from "../../types/completion";
import type { FunctionDefinition } from "../../types/tool";

const LLM_TIMEOUT_MS = 5 * 60 * 1000;
const PROBE_MAX_TOKENS = 1024;

interface ModelCapabilities {
  toolCalling: boolean;
  structuredOutput: boolean;
}

type ProbeResult = boolean | null;

const capabilitiesCache = new Map<string, ModelCapabilities>();

interface MessageWithReasoning {
  content?: string | null;
  reasoning_content?: string | null;
}

function extractMessageText(message: MessageWithReasoning): string {
  if (message.content && message.content.trim()) return message.content;
  if (message.reasoning_content && message.reasoning_content.trim()) {
    return message.reasoning_content;
  }
  return "";
}

function extractJsonBlock(text: string): string | null {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

function isTransportError(error: unknown): boolean {
  return (
    error instanceof OpenAI.APIConnectionError ||
    error instanceof OpenAI.APIConnectionTimeoutError
  );
}

function truncateMessages(
  messages: ChatCompletionMessageParam[],
  maxChars: number,
): ChatCompletionMessageParam[] {
  const total = messages.reduce(
    (sum, m) => sum + (typeof m.content === "string" ? m.content.length : 0),
    0,
  );
  if (total <= maxChars) return messages;

  let remaining = total - maxChars;
  return messages.map((m) => {
    if (remaining <= 0 || typeof m.content !== "string") return m;
    const cut = Math.min(remaining, m.content.length - 1);
    remaining -= cut;
    return { ...m, content: m.content.slice(cut) };
  });
}

function buildCacheKey(config: LocalLLMConfig, model: string): string {
  return `${config.provider}::${config.baseURL ?? ""}::${model}`;
}

const ECHO_TOOL: FunctionDefinition = {
  name: "echo",
  description: "Echo a number",
  parameters: {
    type: "object",
    properties: { value: { type: "number" } },
    required: ["value"],
  },
};

const ECHO_SCHEMA = {
  type: "object",
  properties: { value: { type: "number" } },
  required: ["value"],
};

export class LocalLLMRepositoryAdapter implements LLMSEngineRepositoryPort {
  private client: OpenAI;
  private config: LocalLLMConfig;

  constructor(config: LocalLLMConfig) {
    this.config = config;
    this.client = new OpenAI({
      baseURL: resolveLocalLLMBaseURL(config),
      apiKey: config.apiKey ?? config.provider,
      dangerouslyAllowBrowser: true,
    });
  }

  private limitContext(
    messages: ChatCompletionMessageParam[],
  ): ChatCompletionMessageParam[] {
    return this.config.maxContextChars
      ? truncateMessages(messages, this.config.maxContextChars)
      : messages;
  }

  async handleChat(
    messages: ChatCompletionMessageParam[],
    model: string,
  ): Promise<string> {
    const msgs = this.limitContext(messages);
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt));
      const response = await this.client.chat.completions.create(
        { model, messages: msgs, temperature: 1 },
        { timeout: LLM_TIMEOUT_MS },
      );
      const content = response.choices[0]!.message.content ?? "";
      if (content.trim()) return content;
    }
    return "";
  }

  async handleChatWithTools(
    messages: ChatCompletionMessageParam[],
    model: string,
    toolDefinition: FunctionDefinition,
    _toolName: string,
  ): Promise<string> {
    const strategy: LocalLLMToolCallStrategy =
      this.config.toolCallStrategy ?? "tool_calling";

    if (strategy === "tool_calling") {
      return this.tryToolCalling(messages, model, toolDefinition);
    }
    if (strategy === "structured_output") {
      return this.tryStructuredOutput(messages, model, toolDefinition);
    }
    return this.tryAuto(messages, model, toolDefinition);
  }

  private async tryToolCalling(
    messages: ChatCompletionMessageParam[],
    model: string,
    toolDefinition: FunctionDefinition,
  ): Promise<string> {
    const msgs = this.limitContext(messages);
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt));

      let completion;
      try {
        completion = await this.client.chat.completions.create(
          {
            model,
            messages: msgs,
            temperature: 1,
            tools: [{ type: "function", function: toolDefinition }],
            tool_choice: "required",
          },
          { timeout: LLM_TIMEOUT_MS },
        );
      } catch (err) {
        console.error(`[LocalLLM:tryToolCalling] tentativa ${attempt + 1} falhou:`, err);
        lastError = err;
        continue;
      }
      lastError = undefined;

      const args =
        completion.choices[0]!.message.tool_calls?.[0]?.function?.arguments ??
        "";
      if (
        args.trim() &&
        isStructuredToolResultAcceptable(args, toolDefinition)
      ) {
        return args;
      }

      const text = extractMessageText(completion.choices[0]!.message);
      const match = extractJsonBlock(text);
      if (match && isStructuredToolResultAcceptable(match, toolDefinition)) {
        return match;
      }
    }
    if (lastError) throw lastError;
    return "";
  }

  private async tryStructuredOutput(
    messages: ChatCompletionMessageParam[],
    model: string,
    toolDefinition: FunctionDefinition,
  ): Promise<string> {
    const msgs = this.limitContext(messages);
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt));

      let completion;
      try {
        completion = await this.client.chat.completions.create(
          {
            model,
            messages: msgs,
            temperature: 1,
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
        );
      } catch (err) {
        console.error(`[LocalLLM:tryStructuredOutput] tentativa ${attempt + 1} falhou:`, err);
        lastError = err;
        continue;
      }
      lastError = undefined;

      const content = extractMessageText(completion.choices[0]!.message);
      if (
        content.trim() &&
        isStructuredToolResultAcceptable(content, toolDefinition)
      ) {
        return content;
      }
    }
    if (lastError) throw lastError;
    return "";
  }

  private async tryAuto(
    messages: ChatCompletionMessageParam[],
    model: string,
    toolDefinition: FunctionDefinition,
  ): Promise<string> {
    const caps = await this.detectModelCapabilities(model);

    if (caps.toolCalling) {
      const viaTools = await this.tryToolCalling(
        messages,
        model,
        toolDefinition,
      );
      if (viaTools.trim()) return viaTools;
    }
    if (caps.structuredOutput) {
      const viaSchema = await this.tryStructuredOutput(
        messages,
        model,
        toolDefinition,
      );
      if (viaSchema.trim()) return viaSchema;
    }

    return this.tryPromptedJson(messages, model, toolDefinition);
  }

  private async tryPromptedJson(
    messages: ChatCompletionMessageParam[],
    model: string,
    toolDefinition: FunctionDefinition,
  ): Promise<string> {
    const promptedMessages = this.limitContext([
      ...messages,
      {
        role: "system" as const,
        content:
          "Responda APENAS com um objeto JSON valido, completo e sem campos vazios. " +
          `Schema esperado: ${JSON.stringify(toolDefinition.parameters)}`,
      },
    ]);

    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt));

      let probe;
      try {
        probe = await this.client.chat.completions.create(
          { model, messages: promptedMessages, temperature: 1 },
          { timeout: LLM_TIMEOUT_MS },
        );
      } catch (err) {
        console.error(`[LocalLLM:tryPromptedJson] tentativa ${attempt + 1} falhou:`, err);
        lastError = err;
        continue;
      }
      lastError = undefined;

      const text = extractMessageText(probe.choices[0]!.message);
      const match = extractJsonBlock(text);
      if (match && isStructuredToolResultAcceptable(match, toolDefinition)) {
        return match;
      }
    }

    if (lastError) throw lastError;
    return "";
  }

  private async detectModelCapabilities(
    model: string,
  ): Promise<ModelCapabilities> {
    const key = buildCacheKey(this.config, model);
    const cached = capabilitiesCache.get(key);
    if (cached) return cached;

    const probeMessages: ChatCompletionMessageParam[] = [
      { role: "user", content: "Return the number 42." },
    ];

    const [toolCalling, structuredOutput] = await Promise.all([
      this.probeToolCalling(probeMessages, model),
      this.probeStructuredOutput(probeMessages, model),
    ]);

    const caps: ModelCapabilities = {
      toolCalling: toolCalling ?? false,
      structuredOutput: structuredOutput ?? false,
    };
    if (toolCalling !== null && structuredOutput !== null) {
      capabilitiesCache.set(key, caps);
    }
    return caps;
  }

  private async probeToolCalling(
    messages: ChatCompletionMessageParam[],
    model: string,
  ): Promise<ProbeResult> {
    try {
      const completion = await this.client.chat.completions.create(
        {
          model,
          messages,
          tools: [{ type: "function", function: ECHO_TOOL }],
          tool_choice: "required",
          max_tokens: PROBE_MAX_TOKENS,
        },
        { timeout: 30_000 },
      );
      const args =
        completion.choices[0]!.message.tool_calls?.[0]?.type === "function" ? completion.choices[0]!.message.tool_calls?.[0]?.function?.arguments : "";
      JSON.parse(args); // throws if invalid
      return true;
    } catch (err) {
      return isTransportError(err) ? null : false;
    }
  }

  private async probeStructuredOutput(
    messages: ChatCompletionMessageParam[],
    model: string,
  ): Promise<ProbeResult> {
    try {
      const completion = await this.client.chat.completions.create(
        {
          model,
          messages,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "echo",
              schema: ECHO_SCHEMA,
              strict: true,
            },
          },
          max_tokens: PROBE_MAX_TOKENS,
        },
        { timeout: 30_000 },
      );
      const text = extractMessageText(completion.choices[0]!.message);
      const jsonText = extractJsonBlock(text) ?? text;
      const parsed = JSON.parse(jsonText);
      return typeof parsed.value === "number";
    } catch (err) {
      return isTransportError(err) ? null : false;
    }
  }
}
