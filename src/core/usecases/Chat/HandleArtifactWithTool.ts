import type { ArtifactInput } from "../../domain/ArtifactInput";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { PromptEngineRepositoryPort } from "../../ports/UtilsAndLLMs/PromptEngineRepositoryPort";
import type { FunctionDefinition } from "../../types/tool";
import type { UseCase } from "../_shared/Common";
import { HandleChatWithTool } from "./HandleChatWithTool";

export class HandleArtifactWithTool implements UseCase<
  ArtifactInput & { toolDefinition: FunctionDefinition },
  any[]
> {
  private promptEngineRepository: PromptEngineRepositoryPort;
  private handleChat: HandleChatWithTool;

  constructor(
    llmsEngineRepository: LLMSEngineRepositoryPort,
    promptEngineRepository: PromptEngineRepositoryPort,
  ) {
    this.promptEngineRepository = promptEngineRepository;
    this.handleChat = new HandleChatWithTool(llmsEngineRepository);
  }

  async execute<T>({
    promptRef,
    model,
    toolDefinition,
    lang,
    ...fromT
  }: T & ArtifactInput & { toolDefinition: FunctionDefinition }): Promise<
    any[]
  > {
    const prompts = await this.promptEngineRepository.getPrompt(
      { lang, ...fromT },
      promptRef,
    );
    const chatRoll = await this.handleChat.execute({ prompts, model, toolDefinition });

    const result = chatRoll
      .filter((m) => m.role === "assistant")
      .map((m) => m.content);

    if (!result.length || result.every((e) => !String(e ?? "").trim())) {
      throw new Error(
        "Resposta vazia do modelo — verifique se o modelo está carregado e tente novamente.",
      );
    }

    return result;
  }
}
