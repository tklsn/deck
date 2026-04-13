import type { StarterProjectEpic } from "../../domain/StarterProject/StarterProjectEpic";
import type { StarterProjectEpicStatus } from "../../domain/StarterProject/StarterProjectEpicStatus";
import type { EpicsRepositoryPort } from "../../ports/Project/EpicsRepositoryPort";
import { GetProjectEpicById } from "../_Project/GetProjectEpicById";
import { UpdateProjectEpicStatus } from "../_Project/UpdateProjectEpicStatus";

export abstract class BaseHandleEpicsArtifact {
  protected getProjectEpic: GetProjectEpicById;
  protected updateProjectStatus: UpdateProjectEpicStatus;
  protected projectEpicRepository: EpicsRepositoryPort<
    StarterProjectEpic,
    StarterProjectEpicStatus
  >;

  constructor(
    projectEpicRepository: EpicsRepositoryPort<
      StarterProjectEpic,
      StarterProjectEpicStatus
    >,
  ) {
    this.projectEpicRepository = projectEpicRepository;
    this.getProjectEpic = new GetProjectEpicById(this.projectEpicRepository);
    this.updateProjectStatus = new UpdateProjectEpicStatus(
      this.projectEpicRepository,
    );
  }

  protected async _runEpicLoop(
    epics: StarterProjectEpic[],
    keyOnProject: string,
    keyOfInput: string | string[],
    processEpic: (epic: StarterProjectEpic, context: string) => Promise<void>,
  ): Promise<void> {
    const MAX_RETRIES = 2;

    for (const epic of epics) {
      let actualProject = await this.getProjectEpic.execute({
        epicId: epic.id!,
      });

      if (actualProject.epicStatus[keyOnProject] !== "SUCCESS") {
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          if (attempt > 0)
            await new Promise((r) => setTimeout(r, 1500 * attempt));

          try {
            await this.updateProjectStatus.execute({
              project: actualProject,
              keyOnProject,
              status: "DOING",
            });

            actualProject = await this.getProjectEpic.execute({
              epicId: epic.id,
            });

            const context: string = Array.isArray(keyOfInput)
              ? keyOfInput.map((key) => actualProject[key]).join("\n")
              : actualProject[keyOfInput];

            await processEpic(actualProject, context);

            await this.updateProjectStatus.execute({
              project: actualProject,
              keyOnProject,
              status: "SUCCESS",
            });

            break;
          } catch (error) {
            console.error(`[epic:${keyOnProject}] tentativa ${attempt + 1} falhou:`, error);
            if (attempt === MAX_RETRIES) {
              await this.updateProjectStatus.execute({
                project: actualProject,
                keyOnProject,
                status: "FAILURE",
              });
            }
          }
        }
      }
    }
  }
}
