import type { StarterProjectUserStory } from "../../domain/StarterProject/StarterProjectUserStory";
import type { UserStoriesRepositoryPort } from "../../ports/Project/UserStoriesRepositoryPort";
import type { UseCase } from "../_shared/Common";

type UserStoriesRepository = UserStoriesRepositoryPort<StarterProjectUserStory>;

export class AttachUSOnEpic implements UseCase<StarterProjectUserStory, void> {
  private projectUSRepository: UserStoriesRepository;

  constructor(projectUSRepository: UserStoriesRepository) {
    this.projectUSRepository = projectUSRepository;
  }

  async execute(input: StarterProjectUserStory): Promise<void> | Promise<void> {
    await this.projectUSRepository.save(input);
  }
}
