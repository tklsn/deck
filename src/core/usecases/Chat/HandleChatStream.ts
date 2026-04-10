import type { Prompts } from "../../domain/Prompt";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { ChatCompletionMessageParam } from "../../types/completion";

interface HandleChatStreamInput {
  prompts: Prompts;
  model: string;
  onChunk: (chunk: string) => void;
}

export class HandleChatStream {
  private llmsEngineRepository: LLMSEngineRepositoryPort;

  constructor(llmsEngineRepository: LLMSEngineRepositoryPort) {
    this.llmsEngineRepository = llmsEngineRepository;
  }

  async execute({
    prompts,
    model,
    onChunk,
  }: HandleChatStreamInput): Promise<ChatCompletionMessageParam[]> {
    if (!this.llmsEngineRepository.handleChatStream) {
      throw new Error("This adapter does not support streaming");
    }

    const chatRoll: ChatCompletionMessageParam[] = [
      { role: "system", content: prompts.header },
    ];

    const steps = prompts.loop ?? [];

    if (steps.length === 0) {
      const fullResponse = await this.llmsEngineRepository.handleChatStream(chatRoll, model, onChunk);
      if (fullResponse) chatRoll.push({ role: "assistant", content: fullResponse });
    }

    for (const step of steps) {
      chatRoll.push({ role: "system", content: step });
      const fullResponse = await this.llmsEngineRepository.handleChatStream(chatRoll, model, onChunk);
      if (fullResponse) chatRoll.push({ role: "assistant", content: fullResponse });
    }

    return chatRoll;
  }
}
