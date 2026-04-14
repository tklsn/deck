import type { ChatCompletionMessageParam } from "../../types/completion";
import type { FunctionDefinition } from "../../types/tool";

export interface LLMSEngineRepositoryPort {
  handleChat: (
    messages: ChatCompletionMessageParam[],
    model: string,
  ) => Promise<string>;

  handleChatWithTools: (
    messages: ChatCompletionMessageParam[],
    model: string,
    toolDefinition: FunctionDefinition,
    toolName: string,
  ) => Promise<string>;

}
