import type { ArtifactInput } from "../../domain/ArtifactInput";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { PromptEngineRepositoryPort } from "../../ports/UtilsAndLLMs/PromptEngineRepositoryPort";
import { HandleChatStream } from "./HandleChatStream";
import { HandleArtifactWithTool } from "./HandleArtifactWithTool";

const FLUSH_CHARS = 80;

interface HandleArtifactStreamInput extends ArtifactInput {
  /** Called with accumulated content every ~FLUSH_CHARS characters. Fire-and-forget. */
  onFlush: (accumulated: string) => void;
}

export class HandleArtifactStream {
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
    onFlush,
  }: HandleArtifactStreamInput): Promise<string> {
    const toolDefinition = this.promptEngineRepository.getToolDefinition(promptRef);

    if (toolDefinition) {
      // Tool calling does not support token streaming; fall back to a single-shot call.
      const handleArtifactWithTool = new HandleArtifactWithTool(
        this.llmsEngineRepository,
        this.promptEngineRepository,
      );
      const results = await handleArtifactWithTool.execute({
        context,
        general_instructions,
        promptRef,
        model,
        lang,
        toolDefinition,
      });
      const ended = results.filter(Boolean).join("\n");
      if (!ended.trim()) {
        throw new Error(
          "Resposta vazia do modelo — verifique se o modelo está carregado e tente novamente.",
        );
      }
      onFlush(ended);
      return ended;
    }

    const prompts = await this.promptEngineRepository.getPrompt(
      { context, general_instructions, lang },
      promptRef,
    );

    const handleChatStream = new HandleChatStream(this.llmsEngineRepository);

    let accumulated = "";
    let charsSinceFlush = 0;

    const chatRoll = await handleChatStream.execute({
      prompts,
      model,
      onChunk: (chunk) => {
        accumulated += chunk;
        charsSinceFlush += chunk.length;
        if (charsSinceFlush >= FLUSH_CHARS) {
          onFlush(accumulated);
          charsSinceFlush = 0;
        }
      },
    });

    if (charsSinceFlush > 0 || accumulated.length > 0) {
      onFlush(accumulated);
    }

    // Same final assembly as HandleArtifact
    const final = chatRoll
      .filter((m) => m.role === "assistant")
      .map((m) => m.content)
      .join("\n")
      .replace("[...]", "\n")
      .toString();

    if (!final.trim()) {
      throw new Error(
        "Resposta vazia do modelo em streaming — verifique se o modelo está carregado e tente novamente.",
      );
    }

    return final;
  }
}
