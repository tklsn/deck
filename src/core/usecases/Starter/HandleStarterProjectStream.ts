import type { StarterProject } from "../../domain/StarterProject/StarterProject";
import type { StarterProjectStatus } from "../../domain/StarterProject/StarterProjectStatus";
import type { ProjectRepositoryPort } from "../../ports/Project/ProjectRepositoryPort";
import type { ArtifactEnginePort } from "../../ports/UtilsAndLLMs/ArtifactEnginePort";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { PromptEngineRepositoryPort } from "../../ports/UtilsAndLLMs/PromptEngineRepositoryPort";
import type { UseCase } from "../_shared/Common";
import { HandleArtifactStream } from "../Chat/HandleArtifactStream";
import { BaseHandleStarterProject } from "./BaseHandleStarterProject";

type HandleStarterProjectStreamInput = {
  project: StarterProject;
  model?: string;
  /** Called with (projectId, artifactKey, partialContent) for intermediate DB writes. */
  onPartialArtifact: (projectId: string, key: string, content: string) => void;
};

export class HandleStarterProjectStream
  extends BaseHandleStarterProject
  implements UseCase<HandleStarterProjectStreamInput, StarterProject>
{
  private handleArtifactStream: HandleArtifactStream;

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
    this.handleArtifactStream = new HandleArtifactStream(
      this.llmsRepository,
      this.promptEngineRepository,
    );
  }

  async execute({
    project: _project,
    model: _customModel,
    onPartialArtifact,
  }: HandleStarterProjectStreamInput): Promise<StarterProject> {
    return this._runArtifactLoop(_project, _customModel, (params) =>
      this.handleArtifactStream.execute({
        ...params,
        onFlush: (accumulated) => {
          onPartialArtifact(_project.id!, params.keyOnProject, accumulated);
        },
      }),
    );
  }
}
