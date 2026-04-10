import type { StarterProjectEpic } from "../../domain/StarterProject/StarterProjectEpic";
import type { StarterProjectEpicStatus } from "../../domain/StarterProject/StarterProjectEpicStatus";
import type { EpicsRepositoryPort } from "../../ports/Project/EpicsRepositoryPort";
import type { UseCase } from "../_shared/Common";

interface GetProjectEpicByIdInput {
  epicId: string;
}

export class GetProjectEpicById implements UseCase<
  GetProjectEpicByIdInput,
  StarterProjectEpic
> {
  private projectEpicRepository: EpicsRepositoryPort<
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
  }

  async execute({
    epicId,
  }: GetProjectEpicByIdInput): Promise<StarterProjectEpic> {
    const projectById = await this.projectEpicRepository.findById(epicId);

    if (!projectById) {
      throw new Error("Epic not found");
    }

    return projectById;
  }
}
