import type { StarterProject } from "../../domain/StarterProject/StarterProject";
import type { StarterProjectStatus } from "../../domain/StarterProject/StarterProjectStatus";
import type { ProjectRepositoryPort } from "../../ports/Project/ProjectRepositoryPort";
import type { UseCase } from "../_shared/Common";

export class CreateStarterProject implements UseCase<
  StarterProject,
  StarterProject
> {
  private projectRepository: ProjectRepositoryPort<
    StarterProject,
    StarterProjectStatus
  >;

  constructor(
    projectRepository: ProjectRepositoryPort<
      StarterProject,
      StarterProjectStatus
    >,
  ) {
    this.projectRepository = projectRepository;
  }

  async execute(input: StarterProject): Promise<StarterProject> {
    const project = await this.projectRepository.save(input);

    if (!project) {
      throw new Error("Error creating project");
    }

    return project;
  }
}
