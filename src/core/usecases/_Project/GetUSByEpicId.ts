import type { StarterProjectUserStory } from "../../domain/StarterProject/StarterProjectUserStory";
import type { UserStoriesRepositoryPort } from "../../ports/Project/UserStoriesRepositoryPort";
import type { UseCase } from "../_shared/Common";

interface GetUSByEpicIdInput {
  epicId: string;
}

export class GetUSByEpicId implements UseCase<
  GetUSByEpicIdInput,
  StarterProjectUserStory[]
> {
  private usRepository: UserStoriesRepositoryPort<StarterProjectUserStory>;

  constructor(
    usRepository: UserStoriesRepositoryPort<StarterProjectUserStory>,
  ) {
    this.usRepository = usRepository;
  }

  async execute({
    epicId,
  }: GetUSByEpicIdInput): Promise<StarterProjectUserStory[]> {
    const result = await this.usRepository.listByEpicId(epicId);

    if (!result) {
      throw new Error("User stories not found");
    }

    return result;
  }
}
