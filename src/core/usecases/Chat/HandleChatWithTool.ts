import type { Prompts } from "../../domain/Prompt";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { ChatCompletionMessageParam } from "../../types/completion";
import type { FunctionDefinition } from "../../types/tool";
import type { UseCase } from "../_shared/Common";

interface HandleChatWithToolInput {
  prompts: Prompts;
  model: string;
  toolDefinition: FunctionDefinition;
}

export class HandleChatWithTool implements UseCase<
  HandleChatWithToolInput,
  ChatCompletionMessageParam[]
> {
  private llmsEngineRepository: LLMSEngineRepositoryPort;

  constructor(llmsEngineRepository: LLMSEngineRepositoryPort) {
    this.llmsEngineRepository = llmsEngineRepository;
  }

  async execute({
    prompts,
    model,
    toolDefinition,
  }: HandleChatWithToolInput): Promise<ChatCompletionMessageParam[]> {
    const chatRoll: ChatCompletionMessageParam[] = [
      { role: "system", content: prompts.header },
    ];

    const steps = prompts.loop ?? [];

    if (steps.length === 0) {
      const data = await this.llmsEngineRepository.handleChatWithTools(chatRoll, model, toolDefinition, toolDefinition.name);
      if (data) chatRoll.push({ role: "assistant", content: data });
    }

    for (const step of steps) {
      chatRoll.push({ role: "system", content: step });
      const data = await this.llmsEngineRepository.handleChatWithTools(chatRoll, model, toolDefinition, toolDefinition.name);
      if (data) chatRoll.push({ role: "assistant", content: data });
    }

    return chatRoll;
  }
}
