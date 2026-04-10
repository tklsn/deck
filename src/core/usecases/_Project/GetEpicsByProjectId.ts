import type { StarterProjectEpic } from "../../domain/StarterProject/StarterProjectEpic";
import type { StarterProjectEpicStatus } from "../../domain/StarterProject/StarterProjectEpicStatus";
import type { EpicsRepositoryPort } from "../../ports/Project/EpicsRepositoryPort";
import type { UseCase } from "../_shared/Common";

type EpicsRepository = EpicsRepositoryPort<StarterProjectEpic, StarterProjectEpicStatus>;

export class GetEpicsByProjectId implements UseCase<
  string,
  StarterProjectEpic[]
> {
  private projectEpicRepository: EpicsRepository;

  constructor(projectEpicRepository: EpicsRepository) {
    this.projectEpicRepository = projectEpicRepository;
  }

  async execute(input: string): Promise<StarterProjectEpic[]> {
    const projectById = await this.projectEpicRepository.listByProjectId(input);

    if (!projectById) {
      throw new Error("Project not found");
    }

    return projectById;
  }
}
