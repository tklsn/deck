import type { ArtifactPromptRef } from "../../domain/ArtifactPromptRef";
import type { StarterProjectEpic } from "../../domain/StarterProject/StarterProjectEpic";
import type { StarterProjectEpicStatus } from "../../domain/StarterProject/StarterProjectEpicStatus";
import type { StarterProjectUserStory } from "../../domain/StarterProject/StarterProjectUserStory";
import type { EpicsRepositoryPort } from "../../ports/Project/EpicsRepositoryPort";
import type { UserStoriesRepositoryPort } from "../../ports/Project/UserStoriesRepositoryPort";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { PromptEngineRepositoryPort } from "../../ports/UtilsAndLLMs/PromptEngineRepositoryPort";
import type { FunctionDefinition } from "../../types/tool";
import { AttachUSOnEpic } from "../_Project/AttachUSOnEpic";
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

export class HandleEpicsUserStories
  extends BaseHandleEpicsArtifact
  implements UseCase<HandleProjectEpicInput, void>
{
  private llmsRepository: LLMSEngineRepositoryPort;
  private promptEngineRepository: PromptEngineRepositoryPort;
  private handleArtifact: HandleArtifactWithTool;
  private attachUSOnEpic: AttachUSOnEpic;

  constructor(
    llmsRepository: LLMSEngineRepositoryPort,
    projectEpicRepository: EpicsRepositoryPort<
      StarterProjectEpic,
      StarterProjectEpicStatus
    >,
    promptEngineRepository: PromptEngineRepositoryPort,
    projectUserStoriesRepository: UserStoriesRepositoryPort<StarterProjectUserStory>,
  ) {
    super(projectEpicRepository);
    this.llmsRepository = llmsRepository;
    this.promptEngineRepository = promptEngineRepository;
    this.handleArtifact = new HandleArtifactWithTool(
      this.llmsRepository,
      this.promptEngineRepository,
    );
    this.attachUSOnEpic = new AttachUSOnEpic(projectUserStoriesRepository);
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

        const _result: StarterProjectUserStory[] = JSON.parse(
          result[0],
        ).user_stories;

        for (const userStory of _result) {
          const { description, title, acceptanceCriteria, subtasks } =
            userStory;

          await this.attachUSOnEpic.execute({
            description,
            title,
            acceptanceCriteria,
            subtasks,
            epicId: actualProject.id,
          });
        }
      },
    );
  }
}
