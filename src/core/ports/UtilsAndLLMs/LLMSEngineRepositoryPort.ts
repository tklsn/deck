import type { ChatMessage } from "../../domain/ChatMessage";
import type { FunctionDefinition } from "../../types/tool";

export interface LLMSEngineRepositoryPort {
  handleChat: (
    messages: ChatMessage[],
    model: string,
  ) => Promise<string>;

  handleChatWithTools: (
    messages: ChatMessage[],
    model: string,
    toolDefinition: FunctionDefinition,
    toolName: string,
  ) => Promise<string>;

}
