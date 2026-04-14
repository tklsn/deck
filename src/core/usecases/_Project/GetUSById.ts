import type { StarterProjectUserStory } from "../../domain/StarterProject/StarterProjectUserStory";
import type { UserStoriesRepositoryPort } from "../../ports/Project/UserStoriesRepositoryPort";
import type { UseCase } from "../_shared/Common";

interface GetUSByIdInput {
  usId: string;
}

export class GetUSById implements UseCase<
  GetUSByIdInput,
  StarterProjectUserStory
> {
  private usRepository: UserStoriesRepositoryPort<StarterProjectUserStory>;

  constructor(
    usRepository: UserStoriesRepositoryPort<StarterProjectUserStory>,
  ) {
    this.usRepository = usRepository;
  }

  async execute({ usId }: GetUSByIdInput): Promise<StarterProjectUserStory> {
    const result = await this.usRepository.findById(usId);

    if (!result) {
      throw new Error("User story not found");
    }

    return result;
  }
}
