import type { ProjectRepositoryPort } from "../../ports/Project/ProjectRepositoryPort";
import type { UseCase } from "../_shared/Common";

export class GetProjectById<S, B> implements UseCase<string, S> {
  private projectRepository: ProjectRepositoryPort<S, B>;

  constructor(projectRepository: ProjectRepositoryPort<S, B>) {
    this.projectRepository = projectRepository;
  }

  async execute(input: string): Promise<S> {
    const projectById = await this.projectRepository.findById(input);

    if (!projectById) {
      throw new Error("Project not found");
    }

    return projectById;
  }
}
