import type { ArtifactInput } from "../../domain/ArtifactInput";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { PromptEngineRepositoryPort } from "../../ports/UtilsAndLLMs/PromptEngineRepositoryPort";
import type { UseCase } from "../_shared/Common";
import { HandleChat } from "./HandleChat";

export class HandleArtifact implements UseCase<ArtifactInput, string> {
  private llmsEngineRepository: LLMSEngineRepositoryPort;
  private promptEngineRepository: PromptEngineRepositoryPort;

  constructor(
    llmsEngineRepository: LLMSEngineRepositoryPort,
    promptEngineRepository: PromptEngineRepositoryPort,
  ) {
    this.llmsEngineRepository = llmsEngineRepository;
    this.promptEngineRepository = promptEngineRepository;
  }

  async execute({
    context,
    general_instructions,
    promptRef,
    model,
    lang,
  }: ArtifactInput): Promise<string> {
    const prompts = await this.promptEngineRepository.getPrompt(
      { context, general_instructions, lang },
      promptRef,
    );

    const handleChat = new HandleChat(this.llmsEngineRepository);

    const chatRoll = await handleChat.execute({ prompts, model });

    const ended = chatRoll
      .filter((message) => message.role === `assistant`)
      .map((message) => message.content)
      .join(`\n`)
      .replace(`[...]`, "\n")
      .toString();

    if (!ended.trim()) {
      throw new Error(
        "Resposta vazia do modelo — verifique se o modelo está carregado e tente novamente.",
      );
    }

    return ended;
  }
}
