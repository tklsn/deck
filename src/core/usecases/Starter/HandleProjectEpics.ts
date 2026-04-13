import type { ArtifactPromptRef } from "../../domain/ArtifactPromptRef";
import type { StarterProject } from "../../domain/StarterProject/StarterProject";
import type { StarterProjectEpic } from "../../domain/StarterProject/StarterProjectEpic";
import type { StarterProjectEpicStatus } from "../../domain/StarterProject/StarterProjectEpicStatus";
import type { StarterProjectStatus } from "../../domain/StarterProject/StarterProjectStatus";
import type { EpicsRepositoryPort } from "../../ports/Project/EpicsRepositoryPort";
import type { ProjectRepositoryPort } from "../../ports/Project/ProjectRepositoryPort";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { PromptEngineRepositoryPort } from "../../ports/UtilsAndLLMs/PromptEngineRepositoryPort";
import type { FunctionDefinition } from "../../types/tool";
import { AttachEpicOnProject } from "../_Project/AttachEpicOnProject";
import { GetProjectById } from "../_Project/GetProjectById";
import { UpdateProjectStatus } from "../_Project/UpdateProjectStatus";
import type { UseCase } from "../_shared/Common";
import { HandleArtifactWithTool } from "../Chat/HandleArtifactWithTool";

interface HandleProjectInput {
  project: StarterProject;
  artifact: ArtifactPromptRef;
  toolDefinition: FunctionDefinition;
}

export class HandleProjectEpics implements UseCase<
  HandleProjectInput,
  StarterProjectEpic[]
> {
  private getProject: GetProjectById<StarterProject, StarterProjectStatus>;
  private updateProjectStatus: UpdateProjectStatus<StarterProjectStatus>;
  private handleArtifactWithTool: HandleArtifactWithTool;
  private attachEpicOnProject: AttachEpicOnProject;

  private llmsRepository: LLMSEngineRepositoryPort;
  private projectRepository: ProjectRepositoryPort<
    StarterProject,
    StarterProjectStatus
  >;
  private promptEngineRepository: PromptEngineRepositoryPort;
  private projectEpicRepository: EpicsRepositoryPort<
    StarterProjectEpic,
    StarterProjectEpicStatus
  >;
  constructor(
    llmsRepository: LLMSEngineRepositoryPort,
    projectRepository: ProjectRepositoryPort<
      StarterProject,
      StarterProjectStatus
    >,
    promptEngineRepository: PromptEngineRepositoryPort,
    projectEpicRepository: EpicsRepositoryPort<
      StarterProjectEpic,
      StarterProjectEpicStatus
    >,
  ) {
    this.llmsRepository = llmsRepository;
    this.projectRepository = projectRepository;
    this.promptEngineRepository = promptEngineRepository;
    this.projectEpicRepository = projectEpicRepository;

    this.getProject = new GetProjectById<StarterProject, StarterProjectStatus>(
      this.projectRepository,
    );

    this.updateProjectStatus = new UpdateProjectStatus<StarterProjectStatus>(
      this.projectRepository,
    );

    this.handleArtifactWithTool = new HandleArtifactWithTool(
      this.llmsRepository,
      this.promptEngineRepository,
    );

    this.attachEpicOnProject = new AttachEpicOnProject(
      this.projectEpicRepository,
    );
  }

  async execute({
    project: input,
    artifact,
    toolDefinition,
  }: HandleProjectInput): Promise<StarterProjectEpic[]> {
    let project = await this.getProject.execute(input.id);

    const { keyOnProject, model, promptRef, keyOfInput } = artifact;
    const effectiveModel = project.model ?? model;

    if (project.projectStatus[keyOnProject] !== "SUCCESS") {
      const MAX_RETRIES = 2;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0)
          await new Promise((r) => setTimeout(r, 1500 * attempt));

        try {
          await this.updateProjectStatus.execute({
            project,
            keyOnProject,
            status: "DOING",
          });

          project = await this.getProject.execute(input.id);

          const context: string = Array.isArray(keyOfInput)
            ? keyOfInput.map((key) => project[key]).join("\n")
            : project[keyOfInput];

          const result = await this.handleArtifactWithTool.execute({
            context,
            toolDefinition,
            general_instructions: `Você deve retornar os resultados no seguinte idioma: ${project.lang}`,
            model: effectiveModel,
            promptRef,
            lang: project.lang,
          });

          const _result: StarterProjectEpic[] = JSON.parse(result[0]).epics;

          for (const epic of _result) {
            const { description, name, features } = epic;

            await this.attachEpicOnProject.execute({
              description,
              name,
              features,
              projectId: project.id,
            });
          }

          await this.updateProjectStatus.execute({
            project,
            keyOnProject,
            status: "SUCCESS",
          });

          break;
        } catch (error) {
          console.error(`[epics:${keyOnProject}] tentativa ${attempt + 1} falhou:`, error);
          if (attempt === MAX_RETRIES) {
            await this.updateProjectStatus.execute({
              project,
              keyOnProject,
              status: "FAILURE",
            });
          }
        }
      }
    }

    return (await this.getProject.execute(input.id!)).epics!;
  }
}
