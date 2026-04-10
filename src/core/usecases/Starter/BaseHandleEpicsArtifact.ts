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
    for (const epic of epics) {
      let actualProject = await this.getProjectEpic.execute({
        epicId: epic.id!,
      });

      if (actualProject.epicStatus[keyOnProject] !== "SUCCESS") {
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
        } catch (error) {
          console.error(error);

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
