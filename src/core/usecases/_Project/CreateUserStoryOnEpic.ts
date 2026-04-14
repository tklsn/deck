import type { StarterProjectUserStory } from "../../domain/StarterProject/StarterProjectUserStory";
import type { UserStoriesRepositoryPort } from "../../ports/Project/UserStoriesRepositoryPort";
import type { UseCase } from "../_shared/Common";

type UserStoriesRepository = UserStoriesRepositoryPort<StarterProjectUserStory>;

export class CreateUserStoryOnEpic implements UseCase<StarterProjectUserStory, void> {
  private userStoriesRepository: UserStoriesRepository;

  constructor(userStoriesRepository: UserStoriesRepository) {
    this.userStoriesRepository = userStoriesRepository;
  }

  async execute(input: StarterProjectUserStory): Promise<void> {
    await this.userStoriesRepository.save(input);
  }
}
