import OpenAI from "openai";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import {
  resolveLocalLLMBaseURL,
  type LocalLLMConfig,
  type LocalLLMToolCallStrategy,
} from "../../services/local_llm";
import { isStructuredToolResultAcceptable } from "../../services/artifact_generation";
import type { ChatCompletionMessageParam } from "../../types/completion";
import type { FunctionDefinition } from "../../types/tool";

const LLM_TIMEOUT_MS = 5 * 60 * 1000;

interface ModelCapabilities {
  toolCalling: boolean;
  structuredOutput: boolean;
}

const capabilitiesCache = new Map<string, ModelCapabilities>();

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
      const content = response.choices[0].message.content ?? "";
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
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt));
      const completion = await this.client.chat.completions.create(
        {
          model,
          messages: msgs,
          temperature: 1,
          tools: [{ type: "function", function: toolDefinition }],
          tool_choice: "required",
        },
        { timeout: LLM_TIMEOUT_MS },
      );

      const args =
        completion.choices[0].message.tool_calls?.[0]?.function?.arguments ??
        "";
      if (args.trim() && isStructuredToolResultAcceptable(args, toolDefinition)) {
        return args;
      }

      const text = completion.choices[0].message.content ?? "";
      const match = text.match(/\{[\s\S]*\}/);
      if (
        match
        && isStructuredToolResultAcceptable(match[0], toolDefinition)
      ) {
        return match[0];
      }
    }
    return "";
  }

  private async tryStructuredOutput(
    messages: ChatCompletionMessageParam[],
    model: string,
    toolDefinition: FunctionDefinition,
  ): Promise<string> {
    const msgs = this.limitContext(messages);
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt));
      const completion = await this.client.chat.completions.create(
        {
          model,
          messages: msgs,
          temperature: 1,
          // @ts-expect-error — response_format json_schema not yet typed in openai sdk but supported by Ollama/LM Studio
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

      const content = completion.choices[0].message.content ?? "";
      if (
        content.trim()
        && isStructuredToolResultAcceptable(content, toolDefinition)
      ) {
        return content;
      }
    }
    return "";
  }

  private async tryAuto(
    messages: ChatCompletionMessageParam[],
    model: string,
    toolDefinition: FunctionDefinition,
  ): Promise<string> {
    const caps = await this.detectModelCapabilities(model);

    if (caps.toolCalling) {
      const viaTools = await this.tryToolCalling(messages, model, toolDefinition);
      if (viaTools.trim()) return viaTools;
    }
    if (caps.structuredOutput) {
      const viaSchema = await this.tryStructuredOutput(messages, model, toolDefinition);
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

    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt));
      const probe = await this.client.chat.completions.create(
        { model, messages: promptedMessages, temperature: 1 },
        { timeout: LLM_TIMEOUT_MS },
      );
      const text = probe.choices[0].message.content ?? "";
      const match = text.match(/\{[\s\S]*\}/);
      if (
        match
        && isStructuredToolResultAcceptable(match[0], toolDefinition)
      ) {
        return match[0];
      }
    }

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

    const caps: ModelCapabilities = { toolCalling, structuredOutput };
    capabilitiesCache.set(key, caps);
    return caps;
  }

  private async probeToolCalling(
    messages: ChatCompletionMessageParam[],
    model: string,
  ): Promise<boolean> {
    try {
      const completion = await this.client.chat.completions.create(
        {
          model,
          messages,
          tools: [{ type: "function", function: ECHO_TOOL }],
          tool_choice: "required",
          max_tokens: 64,
        },
        { timeout: 30_000 },
      );
      const args =
        completion.choices[0].message.tool_calls?.[0]?.function?.arguments ??
        "";
      JSON.parse(args); // throws if invalid
      return true;
    } catch {
      return false;
    }
  }

  private async probeStructuredOutput(
    messages: ChatCompletionMessageParam[],
    model: string,
  ): Promise<boolean> {
    try {
      const completion = await this.client.chat.completions.create(
        {
          model,
          messages,
          // @ts-expect-error — response_format json_schema not yet typed in openai sdk but supported by Ollama/LM Studio
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "echo",
              schema: ECHO_SCHEMA,
              strict: true,
            },
          },
          max_tokens: 64,
        },
        { timeout: 30_000 },
      );
      const content = completion.choices[0].message.content ?? "";
      const parsed = JSON.parse(content);
      return typeof parsed.value === "number";
    } catch {
      return false;
    }
  }
}
