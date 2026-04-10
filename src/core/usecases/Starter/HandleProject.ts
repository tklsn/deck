import type { StarterProject } from "../../domain/StarterProject/StarterProject";
import type { StarterProjectStatus } from "../../domain/StarterProject/StarterProjectStatus";
import type { ProjectRepositoryPort } from "../../ports/Project/ProjectRepositoryPort";
import type { ArtifactEnginePort } from "../../ports/UtilsAndLLMs/ArtifactEnginePort";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { PromptEngineRepositoryPort } from "../../ports/UtilsAndLLMs/PromptEngineRepositoryPort";
import type { UseCase } from "../_shared/Common";
import { HandleArtifact } from "../Chat/HandleArtifact";
import { BaseHandleStarterProject } from "./BaseHandleStarterProject";

type HandleStarterProjectInput = {
  project: StarterProject;
  model?: string;
};

export class HandleStarterProject
  extends BaseHandleStarterProject
  implements UseCase<HandleStarterProjectInput, StarterProject>
{
  private handleArtifact: HandleArtifact;

  constructor(
    llmsRepository: LLMSEngineRepositoryPort,
    promptEngineRepository: PromptEngineRepositoryPort,
    projectRepository: ProjectRepositoryPort<
      StarterProject,
      StarterProjectStatus
    >,
    artifactEngineRepository: ArtifactEnginePort<StarterProject>,
  ) {
    super(llmsRepository, promptEngineRepository, projectRepository, artifactEngineRepository);
    this.handleArtifact = new HandleArtifact(
      this.llmsRepository,
      this.promptEngineRepository,
    );
  }

  async execute({ project: _project, model: _customModel }: HandleStarterProjectInput): Promise<StarterProject> {
    return this._runArtifactLoop(_project, _customModel, (params) =>
      this.handleArtifact.execute(params),
    );
  }
}
