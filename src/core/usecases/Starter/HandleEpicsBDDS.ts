import type { ArtifactPromptRef } from "../../domain/ArtifactPromptRef";
import type { StarterProjectEpic } from "../../domain/StarterProject/StarterProjectEpic";
import type { StarterProjectEpicStatus } from "../../domain/StarterProject/StarterProjectEpicStatus";
import type { EpicsRepositoryPort } from "../../ports/Project/EpicsRepositoryPort";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { PromptEngineRepositoryPort } from "../../ports/UtilsAndLLMs/PromptEngineRepositoryPort";
import type { FunctionDefinition } from "../../types/tool";
import type { UseCase } from "../_shared/Common";
import { HandleArtifactWithTool } from "../Chat/HandleArtifactWithTool";
import { BaseHandleEpicsArtifact } from "./BaseHandleEpicsArtifact";

interface HandleProjectEpicInput {
  project: StarterProjectEpic[];
  artifact: ArtifactPromptRef;
  toolDefinition: FunctionDefinition;
  lang: string;
  model?: string;
}

export class HandleEpicsBDDS
  extends BaseHandleEpicsArtifact
  implements UseCase<HandleProjectEpicInput, void>
{
  private llmsRepository: LLMSEngineRepositoryPort;
  private promptEngineRepository: PromptEngineRepositoryPort;
  private handleArtifact: HandleArtifactWithTool;

  constructor(
    llmsRepository: LLMSEngineRepositoryPort,
    projectEpicRepository: EpicsRepositoryPort<
      StarterProjectEpic,
      StarterProjectEpicStatus
    >,
    promptEngineRepository: PromptEngineRepositoryPort,
  ) {
    super(projectEpicRepository);
    this.llmsRepository = llmsRepository;
    this.promptEngineRepository = promptEngineRepository;
    this.handleArtifact = new HandleArtifactWithTool(
      this.llmsRepository,
      this.promptEngineRepository,
    );
  }

  async execute({
    project: input,
    artifact,
    toolDefinition,
    lang,
    model: projectModel,
  }: HandleProjectEpicInput): Promise<void> {
    const { keyOnProject, model, promptRef, keyOfInput } = artifact;
    const effectiveModel = projectModel ?? model;

    await this._runEpicLoop(
      input,
      keyOnProject,
      keyOfInput,
      async (actualProject, context) => {
        const result = await this.handleArtifact.execute({
          context,
          toolDefinition,
          general_instructions: `Você deve retornar os resultados no seguinte idioma: ${lang}`,
          model: effectiveModel,
          promptRef,
          lang,
        });

        // The prompt has a 2-step loop; take the last non-empty result since
        // step 2 runs with the context of step 1 and produces the complete output.
        const bddJson = result.filter(Boolean).pop() ?? result[0];
        actualProject[keyOnProject] = bddJson;
        await this.projectEpicRepository.update(actualProject);
      },
    );
  }
}
