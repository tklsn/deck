import type { Prompts } from "../../domain/Prompt";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { ChatMessage } from "../../domain/ChatMessage";
import type { UseCase } from "../_shared/Common";

interface HandleChatInput {
  prompts: Prompts;
  model: string;
  onProgress?: (partial: string) => void;
}

export class HandleChat implements UseCase<
  HandleChatInput,
  ChatMessage[]
> {
  private llmsEngineRepository: LLMSEngineRepositoryPort;

  constructor(llmsEngineRepository: LLMSEngineRepositoryPort) {
    this.llmsEngineRepository = llmsEngineRepository;
  }

  async execute({
    prompts,
    model,
    onProgress,
  }: HandleChatInput): Promise<ChatMessage[]> {
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
      const data = await this.llmsEngineRepository.handleChat(chatRoll, model, onChunk);
      if (data) chatRoll.push({ role: "assistant", content: data });
    }

    for (const step of steps) {
      chatRoll.push({ role: "user", content: step });
      const data = await this.llmsEngineRepository.handleChat(chatRoll, model, onChunk);
      if (data) chatRoll.push({ role: "assistant", content: data });
    }

    return chatRoll;
  }
}
