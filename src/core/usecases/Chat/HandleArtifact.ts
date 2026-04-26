import type { ArtifactInput } from "../../domain/ArtifactInput";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { PromptEngineRepositoryPort } from "../../ports/UtilsAndLLMs/PromptEngineRepositoryPort";
import {
  buildArtifactTextFallbackPrompt,
  isArtifactResultAcceptable,
  isFallbackTextAcceptable,
  supportsFreeTextArtifactFallback,
} from "../../services/artifact_generation";
import type { UseCase } from "../_shared/Common";
import { HandleChat } from "./HandleChat";
import { HandleArtifactWithTool } from "./HandleArtifactWithTool";

export class HandleArtifact implements UseCase<ArtifactInput, string> {
  private promptEngineRepository: PromptEngineRepositoryPort;
  private handleWithTool: HandleArtifactWithTool;
  private handleChat: HandleChat;

  constructor(
    llmsEngineRepository: LLMSEngineRepositoryPort,
    promptEngineRepository: PromptEngineRepositoryPort,
  ) {
    this.promptEngineRepository = promptEngineRepository;
    this.handleWithTool = new HandleArtifactWithTool(llmsEngineRepository, promptEngineRepository);
    this.handleChat = new HandleChat(llmsEngineRepository);
  }

  async execute({
    context,
    general_instructions,
    promptRef,
    model,
    lang,
  }: ArtifactInput): Promise<string> {
    const toolDefinition = this.promptEngineRepository.getToolDefinition(promptRef);

    if (toolDefinition) {
      const result = (
        await this.handleWithTool.execute({
          context,
          general_instructions,
          promptRef,
          model,
          lang,
          toolDefinition,
        })
      )
        .filter(Boolean)
        .join("\n");

      if (isArtifactResultAcceptable(result, promptRef, toolDefinition)) {
        return result;
      }

      if (supportsFreeTextArtifactFallback(promptRef)) {
        const prompts = await this.promptEngineRepository.getPrompt(
          { context, general_instructions, lang },
          promptRef,
        );

        const chatRoll = await this.handleChat.execute({
          prompts: {
            ...prompts,
            header: buildArtifactTextFallbackPrompt(prompts.header),
          },
          model,
        });

        const fallback = chatRoll
          .filter((m) => m.role === "assistant")
          .map((m) => m.content)
          .join("\n")
          .replace("[...]", "\n")
          .toString();

        if (isFallbackTextAcceptable(fallback)) {
          return fallback;
        }
      }

      throw new Error(
        "Resposta incompleta do modelo — o artefato nao atingiu completude minima.",
      );
    }

    const prompts = await this.promptEngineRepository.getPrompt(
      { context, general_instructions, lang },
      promptRef,
    );
    const chatRoll = await this.handleChat.execute({ prompts, model });

    const result = chatRoll
      .filter((m) => m.role === "assistant")
      .map((m) => m.content)
      .join("\n")
      .replace("[...]", "\n")
      .toString();

    if (!result.trim()) {
      throw new Error(
        "Resposta vazia do modelo — verifique se o modelo está carregado e tente novamente.",
      );
    }

    return result;
  }
}
