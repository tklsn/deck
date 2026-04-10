import type { ArtifactInput } from "../../domain/ArtifactInput";
import type { StarterProject } from "../../domain/StarterProject/StarterProject";
import type { StarterProjectStatus } from "../../domain/StarterProject/StarterProjectStatus";
import type { ProjectRepositoryPort } from "../../ports/Project/ProjectRepositoryPort";
import type { ArtifactEnginePort } from "../../ports/UtilsAndLLMs/ArtifactEnginePort";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { PromptEngineRepositoryPort } from "../../ports/UtilsAndLLMs/PromptEngineRepositoryPort";
import { GetProjectById } from "../_Project/GetProjectById";
import { UpdateProjectStatus } from "../_Project/UpdateProjectStatus";

export type ArtifactStepParams = ArtifactInput & { keyOnProject: string };

export abstract class BaseHandleStarterProject {
  protected getProject: GetProjectById<StarterProject, StarterProjectStatus>;
  protected updateProjectStatus: UpdateProjectStatus<StarterProjectStatus>;

  protected llmsRepository: LLMSEngineRepositoryPort;
  protected promptEngineRepository: PromptEngineRepositoryPort;
  protected projectRepository: ProjectRepositoryPort<
    StarterProject,
    StarterProjectStatus
  >;
  protected artifactEngineRepository: ArtifactEnginePort<StarterProject>;

  constructor(
    llmsRepository: LLMSEngineRepositoryPort,
    promptEngineRepository: PromptEngineRepositoryPort,
    projectRepository: ProjectRepositoryPort<
      StarterProject,
      StarterProjectStatus
    >,
    artifactEngineRepository: ArtifactEnginePort<StarterProject>,
  ) {
    this.llmsRepository = llmsRepository;
    this.promptEngineRepository = promptEngineRepository;
    this.projectRepository = projectRepository;
    this.artifactEngineRepository = artifactEngineRepository;

    this.getProject = new GetProjectById<StarterProject, StarterProjectStatus>(
      this.projectRepository,
    );
    this.updateProjectStatus = new UpdateProjectStatus<StarterProjectStatus>(
      this.projectRepository,
    );
  }

  protected async _runArtifactLoop(
    _project: StarterProject,
    _customModel: string | undefined,
    processStep: (params: ArtifactStepParams) => Promise<string>,
  ): Promise<StarterProject> {
    let project = await this.getProject.execute(_project.id!);

    const _artifacts =
      await this.artifactEngineRepository.getArtifactPromptRef();

    for (const resource of _artifacts) {
      const { keyOnProject, model, promptRef, keyOfInput } = resource;

      if (project.projectStatus[keyOnProject] === "SUCCESS") continue;

      try {
        await this.updateProjectStatus.execute({
          project,
          keyOnProject,
          status: "DOING",
        });

        project = await this.getProject.execute(_project.id!);

        const context: string = Array.isArray(keyOfInput)
          ? keyOfInput
              .map((key) => project[key as keyof StarterProject] as string)
              .join("\n")
          : (project[keyOfInput as keyof StarterProject] as string);

        const general_instructions = `Você deve retornar os resultados no seguinte idioma: ${project.lang}`;

        const result = await processStep({
          context,
          general_instructions,
          model: _customModel ?? model,
          promptRef,
          lang: project.lang,
          keyOnProject,
        });

        project[keyOnProject as keyof StarterProject] = result as never;
        await this.projectRepository.update(project);

        await this.updateProjectStatus.execute({
          project,
          keyOnProject,
          status: "SUCCESS",
        });
      } catch (error) {
        await this.updateProjectStatus.execute({
          project,
          keyOnProject,
          status: "FAILURE",
        });
        console.error(error);
        break;
      }
    }

    return await this.getProject.execute(_project.id!);
  }
}
