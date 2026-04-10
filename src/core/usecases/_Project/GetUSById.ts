import type { StarterProjectUserStory } from "../../domain/StarterProject/StarterProjectUserStory";
import type { UserStoriesRepositoryPort } from "../../ports/Project/UserStoriesRepositoryPort";
import type { CacheStoragePort } from "../../ports/UtilsAndLLMs/CacheStoragePort";
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
    cacheRepository: CacheStoragePort,
  ) {
    this.usRepository = usRepository;
    this.cacheRepository = cacheRepository;
  }

  async execute({ usId }: GetUSByIdInput): Promise<StarterProjectUserStory> {
    const result = await this.usRepository.findById(usId);

    if (!result) {
      throw new Error("User story not found");
    }

    return result;
  }
}
