import type { AIStatus } from "../../domain/AIStatus";
import type { StarterProjectEpic } from "../../domain/StarterProject/StarterProjectEpic";
import type { StarterProjectEpicStatus } from "../../domain/StarterProject/StarterProjectEpicStatus";
import type { EpicsRepositoryPort } from "../../ports/Project/EpicsRepositoryPort";
import type { UseCase } from "../_shared/Common";

interface UpdateProjectEpicStatusInput {
  project: StarterProjectEpic;
  keyOnProject: string;
  status: AIStatus;
}

export class UpdateProjectEpicStatus implements UseCase<
  UpdateProjectEpicStatusInput,
  StarterProjectEpicStatus
> {
  private projectRepositoryEpic: EpicsRepositoryPort<
    StarterProjectEpic,
    StarterProjectEpicStatus
  >;

  constructor(
    projectRepositoryEpic: EpicsRepositoryPort<
      StarterProjectEpic,
      StarterProjectEpicStatus
    >,
  ) {
    this.projectRepositoryEpic = projectRepositoryEpic;
  }

  async execute({
    keyOnProject,
    status,
    project,
  }: UpdateProjectEpicStatusInput): Promise<StarterProjectEpicStatus> {
    const updated = await this.projectRepositoryEpic.updateStatus(
      project,
      keyOnProject,
      status,
    );

    return updated;
  }
}
