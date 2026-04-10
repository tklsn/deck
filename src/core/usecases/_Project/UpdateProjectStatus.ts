import type { AIStatus } from "../../domain/AIStatus";
import type { ProjectBase } from "../../domain/Project/ProjectBase";
import type { ProjectRepositoryPort } from "../../ports/Project/ProjectRepositoryPort";
import type { UseCase } from "../_shared/Common";

interface UpdateProjectStatusInput<S> {
  project: Partial<ProjectBase<S>>;
  keyOnProject: string;
  status: AIStatus;
}

export class UpdateProjectStatus<St> implements UseCase<
  UpdateProjectStatusInput<St>,
  St
> {
  private projectRepository: ProjectRepositoryPort<
    Partial<ProjectBase<St>>,
    St
  >;

  constructor(
    projectRepository: ProjectRepositoryPort<Partial<ProjectBase<St>>, St>,
  ) {
    this.projectRepository = projectRepository;
  }

  async execute(input: UpdateProjectStatusInput<St>): Promise<St> {
    const { project, keyOnProject, status } = input;

    const updated = await this.projectRepository.updateStatus(
      project,
      keyOnProject,
      status,
    );

    return updated;
  }
}
