import type { ProjectRepositoryPort } from "../../ports/Project/ProjectRepositoryPort";
import type { UseCase } from "../_shared/Common";

interface UpdateProjectByIdInput<S> {
  id: string;
  payload: S;
}

export class UpdateProjectById<S, B> implements UseCase<
  UpdateProjectByIdInput<S>,
  S
> {
  private projectRepository: ProjectRepositoryPort<S, B>;

  constructor(projectRepository: ProjectRepositoryPort<S, B>) {
    this.projectRepository = projectRepository;
  }

  async execute(input: UpdateProjectByIdInput<S>): Promise<S> {
    const projectById = await this.projectRepository.update(input.payload);

    if (!projectById) {
      throw new Error("Project not found");
    }

    return projectById;
  }
}
