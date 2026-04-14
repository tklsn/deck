import type { ArtifactPromptRef } from "../../domain/ArtifactPromptRef";
import type { StarterProjectEpic } from "../../domain/StarterProject/StarterProjectEpic";
import type { StarterProjectEpicStatus } from "../../domain/StarterProject/StarterProjectEpicStatus";
import type { StarterProjectUserStory } from "../../domain/StarterProject/StarterProjectUserStory";
import type { EpicsRepositoryPort } from "../../ports/Project/EpicsRepositoryPort";
import type { UserStoriesRepositoryPort } from "../../ports/Project/UserStoriesRepositoryPort";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { PromptEngineRepositoryPort } from "../../ports/UtilsAndLLMs/PromptEngineRepositoryPort";
import type { FunctionDefinition } from "../../types/tool";
import { CreateUserStoryOnEpic } from "../_Project/CreateUserStoryOnEpic";
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

export class HandleEpicsUserStories
  extends BaseHandleEpicsArtifact
  implements UseCase<HandleProjectEpicInput, void>
{
  private handleArtifact: HandleArtifactWithTool;
  private attachUSOnEpic: CreateUserStoryOnEpic;

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
    this.handleArtifact = new HandleArtifactWithTool(llmsRepository, promptEngineRepository);
    this.attachUSOnEpic = new CreateUserStoryOnEpic(projectUserStoriesRepository);
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

        const userStories: StarterProjectUserStory[] = JSON.parse(result[0]).user_stories;

        for (const { description, title, acceptanceCriteria, subtasks } of userStories) {
          await this.attachUSOnEpic.execute({
            description,
            title,
            acceptanceCriteria,
            subtasks,
            epicId: epic.id,
          });
        }
      },
    );
  }
}
