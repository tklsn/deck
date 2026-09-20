import type { ArtifactInput } from "../../domain/ArtifactInput";
import type { StarterProject } from "../../domain/StarterProject/StarterProject";
import type { StarterProjectStatus } from "../../domain/StarterProject/StarterProjectStatus";
import type { ProjectRepositoryPort } from "../../ports/Project/ProjectRepositoryPort";
import type { ArtifactEnginePort } from "../../ports/UtilsAndLLMs/ArtifactEnginePort";
import type { LLMSEngineRepositoryPort } from "../../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import type { PromptEngineRepositoryPort } from "../../ports/UtilsAndLLMs/PromptEngineRepositoryPort";
import { GetProjectById } from "../_Project/GetProjectById";
import { UpdateProjectStatus } from "../_Project/UpdateProjectStatus";
import { langInstruction } from "../_shared/Common";

const PROGRESS_FLUSH_MS = 300;

// Grava o texto parcial (throttled). close() descarta o pendente e espera a escrita em voo,
// para nunca sobrescrever o resultado final.
function createProgressWriter(write: (text: string) => Promise<void>) {
  let latest: string | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let chain: Promise<void> = Promise.resolve();
  let closed = false;

  const flush = () => {
    timer = undefined;
    if (closed || latest === null) return;
    const text = latest;
    latest = null;
    chain = chain.then(() => write(text)).catch(console.error);
  };

  return {
    push(text: string) {
      if (closed) return;
      latest = text;
      timer ??= setTimeout(flush, PROGRESS_FLUSH_MS);
    },
    async close() {
      closed = true;
      clearTimeout(timer);
      await chain;
    },
  };
}

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
    project: StarterProject,
    customModel: string | undefined,
    processStep: (params: ArtifactStepParams) => Promise<string>,
  ): Promise<StarterProject> {
    let current = await this.getProject.execute(project.id!);

    const artifacts = await this.artifactEngineRepository.getArtifactPromptRef();

    const MAX_RETRIES = 2;

    for (const resource of artifacts) {
      const { keyOnProject, model, promptRef, keyOfInput } = resource;

      if (current.projectStatus[keyOnProject] === "SUCCESS") continue;

      let success = false;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0)
          await new Promise((r) => setTimeout(r, 1500 * attempt));

        try {
          await this.updateProjectStatus.execute({
            project: current,
            keyOnProject,
            status: "DOING",
          });

          current = await this.getProject.execute(project.id!);

          const context: string = Array.isArray(keyOfInput)
            ? keyOfInput
                .map((key) => current[key as keyof StarterProject] as string)
                .filter(Boolean)
                .join("\n\n")
            : (current[keyOfInput as keyof StarterProject] as string);

          const progress = createProgressWriter(async (text) => {
            current[keyOnProject as keyof StarterProject] = text as never;
            await this.projectRepository.update(current);
          });

          let result: string;
          try {
            result = await processStep({
              context,
              general_instructions: langInstruction(current.lang),
              model: customModel ?? model,
              promptRef,
              lang: current.lang,
              keyOnProject,
              onProgress: progress.push,
            });
          } catch (error) {
            await progress.close();
            // Nao deixa JSON truncado no lugar do artefato.
            current[keyOnProject as keyof StarterProject] = "" as never;
            await this.projectRepository.update(current);
            throw error;
          }
          await progress.close();

          current[keyOnProject as keyof StarterProject] = result as never;
          await this.projectRepository.update(current);

          await this.updateProjectStatus.execute({
            project: current,
            keyOnProject,
            status: "SUCCESS",
          });

          success = true;
          break;
        } catch (error) {
          console.error(`[artifact:${keyOnProject}] tentativa ${attempt + 1} falhou:`, error);
          if (attempt === MAX_RETRIES) {
            await this.updateProjectStatus.execute({
              project: current,
              keyOnProject,
              status: "FAILURE",
            });
          }
        }
      }

      if (!success) break;
    }

    return await this.getProject.execute(project.id!);
  }
}
