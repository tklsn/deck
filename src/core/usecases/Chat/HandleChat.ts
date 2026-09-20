import type { Prompts } from "../../domain/Prompt";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { ChatMessage } from "../../domain/ChatMessage";
import type { UseCase } from "../_shared/Common";

interface HandleChatInput {
  prompts: Prompts;
  model: string;
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
  }: HandleChatInput): Promise<ChatMessage[]> {
    const chatRoll: ChatMessage[] = [
      { role: "system", content: prompts.header },
    ];

    const steps = prompts.loop ?? [];

    if (steps.length === 0) {
      chatRoll.push({ role: "user", content: "Execute a tarefa descrita acima." });
      const data = await this.llmsEngineRepository.handleChat(chatRoll, model);
      if (data) chatRoll.push({ role: "assistant", content: data });
    }

    for (const step of steps) {
      chatRoll.push({ role: "user", content: step });
      const data = await this.llmsEngineRepository.handleChat(chatRoll, model);
      if (data) chatRoll.push({ role: "assistant", content: data });
    }

    return chatRoll;
  }
}
