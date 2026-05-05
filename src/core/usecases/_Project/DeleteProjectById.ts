import type { ProjectRepositoryPort } from "../../ports/Project/ProjectRepositoryPort";
import type { UseCase } from "../_shared/Common";

interface DeleteProjectByIdInput {
  id: string;
}

export class DeleteProjectById<S, B> implements UseCase<
  DeleteProjectByIdInput,
  void
> {
  private projectRepository: ProjectRepositoryPort<S, B>;

  constructor(projectRepository: ProjectRepositoryPort<S, B>) {
    this.projectRepository = projectRepository;
  }

  async execute(input: DeleteProjectByIdInput): Promise<void> {
    await this.projectRepository.delete(input.id);
  }
}
