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
  private llmsEngineRepository: LLMSEngineRepositoryPort;
  private promptEngineRepository: PromptEngineRepositoryPort;

  constructor(
    llmsEngineRepository: LLMSEngineRepositoryPort,
    promptEngineRepository: PromptEngineRepositoryPort,
  ) {
    this.llmsEngineRepository = llmsEngineRepository;
    this.promptEngineRepository = promptEngineRepository;
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

    const handleChat = new HandleChatWithTool(this.llmsEngineRepository);

    const chatRoll = await handleChat.execute({
      prompts,
      model,
      toolDefinition,
    });

    const ended = chatRoll
      .filter((message) => message.role === `assistant`)
      .map((message) => message.content);

    if (!ended.length || ended.every((e) => !String(e ?? "").trim())) {
      throw new Error(
        "Resposta vazia do modelo — verifique se o modelo está carregado e tente novamente.",
      );
    }

    return ended;
  }
}
