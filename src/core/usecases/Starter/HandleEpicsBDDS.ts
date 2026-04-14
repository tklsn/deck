import type { ArtifactPromptRef } from "../../domain/ArtifactPromptRef";
import type { StarterProjectEpic } from "../../domain/StarterProject/StarterProjectEpic";
import type { StarterProjectEpicStatus } from "../../domain/StarterProject/StarterProjectEpicStatus";
import type { EpicsRepositoryPort } from "../../ports/Project/EpicsRepositoryPort";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { PromptEngineRepositoryPort } from "../../ports/UtilsAndLLMs/PromptEngineRepositoryPort";
import type { FunctionDefinition } from "../../types/tool";
import type { UseCase } from "../_shared/Common";
import { langInstruction } from "../_shared/Common";
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
    this.handleArtifact = new HandleArtifactWithTool(llmsRepository, promptEngineRepository);
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
      async (epic, context) => {
        const result = await this.handleArtifact.execute({
          context,
          toolDefinition,
          general_instructions: langInstruction(lang),
          model: effectiveModel,
          promptRef,
          lang,
        });

        // The prompt has a 2-step loop; take the last non-empty result since
        // step 2 runs with the context of step 1 and produces the complete output.
        const bddJson = result.filter(Boolean).pop() ?? result[0];
        epic[keyOnProject] = bddJson;
        await this.projectEpicRepository.update(epic);
      },
    );
  }
}
