import type { Prompts } from "../../domain/Prompt";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { ChatMessage } from "../../domain/ChatMessage";
import type { FunctionDefinition } from "../../types/tool";
import type { UseCase } from "../_shared/Common";

interface HandleChatWithToolInput {
  prompts: Prompts;
  model: string;
  toolDefinition: FunctionDefinition;
  onProgress?: (partial: string) => void;
}

export class HandleChatWithTool implements UseCase<
  HandleChatWithToolInput,
  ChatMessage[]
> {
  private llmsEngineRepository: LLMSEngineRepositoryPort;

  constructor(llmsEngineRepository: LLMSEngineRepositoryPort) {
    this.llmsEngineRepository = llmsEngineRepository;
  }

  async execute({
    prompts,
    model,
    toolDefinition,
    onProgress,
  }: HandleChatWithToolInput): Promise<ChatMessage[]> {
    const chatRoll: ChatMessage[] = [
      { role: "system", content: prompts.header },
    ];

    const steps = prompts.loop ?? [];

    // Steps ja concluidos + parcial do step atual (mesmo join do resultado final).
    const onChunk = onProgress
      ? (accumulated: string) => {
          const done = chatRoll
            .filter((m) => m.role === "assistant")
            .map((m) => m.content)
            .join("\n");
          onProgress(done ? `${done}\n${accumulated}` : accumulated);
        }
      : undefined;

    if (steps.length === 0) {
      chatRoll.push({ role: "user", content: "Execute a tarefa descrita acima." });
      const data = await this.llmsEngineRepository.handleChatWithTools(chatRoll, model, toolDefinition, toolDefinition.name, onChunk);
      if (data) chatRoll.push({ role: "assistant", content: data });
    }

    for (const step of steps) {
      chatRoll.push({ role: "user", content: step });
      const data = await this.llmsEngineRepository.handleChatWithTools(chatRoll, model, toolDefinition, toolDefinition.name, onChunk);
      if (data) chatRoll.push({ role: "assistant", content: data });
    }

    return chatRoll;
  }
}
