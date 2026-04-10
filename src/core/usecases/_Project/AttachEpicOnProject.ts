import type { StarterProjectEpic } from "../../domain/StarterProject/StarterProjectEpic";
import type { StarterProjectEpicStatus } from "../../domain/StarterProject/StarterProjectEpicStatus";
import type { EpicsRepositoryPort } from "../../ports/Project/EpicsRepositoryPort";
import type { UseCase } from "../_shared/Common";

type projectEpicRepository = EpicsRepositoryPort<
  StarterProjectEpic,
  StarterProjectEpicStatus
>;

export class AttachEpicOnProject implements UseCase<StarterProjectEpic, void> {
  private projectEpicRepository: projectEpicRepository;

  constructor(projectEpicRepository: projectEpicRepository) {
    this.projectEpicRepository = projectEpicRepository;
  }

  async execute(input: StarterProjectEpic): Promise<void> | Promise<void> {
    await this.projectEpicRepository.save(input);
  }
}
