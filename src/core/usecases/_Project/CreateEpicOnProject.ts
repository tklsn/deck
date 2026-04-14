import type { StarterProjectEpic } from "../../domain/StarterProject/StarterProjectEpic";
import type { StarterProjectEpicStatus } from "../../domain/StarterProject/StarterProjectEpicStatus";
import type { EpicsRepositoryPort } from "../../ports/Project/EpicsRepositoryPort";
import type { UseCase } from "../_shared/Common";

type EpicsRepository = EpicsRepositoryPort<StarterProjectEpic, StarterProjectEpicStatus>;

export class CreateEpicOnProject implements UseCase<StarterProjectEpic, void> {
  private projectEpicRepository: EpicsRepository;

  constructor(projectEpicRepository: EpicsRepository) {
    this.projectEpicRepository = projectEpicRepository;
  }

  async execute(input: StarterProjectEpic): Promise<void> {
    await this.projectEpicRepository.save(input);
  }
}
