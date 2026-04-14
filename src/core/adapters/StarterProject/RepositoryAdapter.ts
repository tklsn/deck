import { starterProjectDB } from "../../database/StarterProjectDB";
import type { AIStatus } from "../../domain/AIStatus";
import type { StarterProject } from "../../domain/StarterProject/StarterProject";
import type { StarterProjectStatus } from "../../domain/StarterProject/StarterProjectStatus";
import type { ProjectRepositoryPort } from "../../ports/Project/ProjectRepositoryPort";

export class ProjectRepositoryAdapter implements ProjectRepositoryPort<
  StarterProject,
  StarterProjectStatus
> {
  constructor(private db = starterProjectDB) {}

  async save(project: StarterProject): Promise<StarterProject> {
    const { id: _, projectStatus: __, epics: ___, ...rest } = project;
    const id = crypto.randomUUID();
    const now = new Date();

    const record = { ...rest, id, createdAt: now, updatedAt: now };
    await this.db.starterProjects.add(record);

    const statusId = crypto.randomUUID();
    const projectStatus: StarterProjectStatus = {
      id: statusId,
      projectId: id,
      expandedPrompt: 'PENDING',
      requirementDocument: 'PENDING',
      projectPlan: 'PENDING',
      projectScope: 'PENDING',
      projectArchitecture: 'PENDING',
      epics: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };
    await this.db.starterProjectStatuses.add(projectStatus);

    return { ...record, projectStatus };
  }

  async findById(id: string): Promise<StarterProject | null> {
    const record = await this.db.starterProjects.get(id);
    if (!record) return null;

    const projectStatus = await this.db.starterProjectStatuses
      .where("projectId")
      .equals(id)
      .first();
    const epics = await this.db.starterProjectEpics
      .where("projectId")
      .equals(id)
      .toArray();

    return { ...record, projectStatus, epics };
  }

  async update(project: StarterProject): Promise<StarterProject> {
    const { projectStatus: _, epics: __, ...rest } = project;
    const updated = { ...rest, updatedAt: new Date() } as typeof rest & {
      id: string;
    };
    await this.db.starterProjects.put(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const epics = await this.db.starterProjectEpics
      .where("projectId")
      .equals(id)
      .toArray();

    for (const epic of epics) {
      await this.db.starterProjectEpicStatuses
        .where("epicId")
        .equals(epic.id)
        .delete();
      await this.db.starterProjectUserStories
        .where("epicId")
        .equals(epic.id)
        .delete();
    }
    await this.db.starterProjectEpics.where("projectId").equals(id).delete();

    const status = await this.db.starterProjectStatuses
      .where("projectId")
      .equals(id)
      .first();
    if (status?.id) {
      await this.db.starterProjectStatuses.delete(status.id);
    }

    await this.db.starterProjects.delete(id);
  }

  async list(): Promise<StarterProject[]> {
    return await this.db.starterProjects.toArray();
  }

  async listByUserId(userId: string): Promise<StarterProject[]> {
    return await this.db.starterProjects
      .where("userId")
      .equals(userId)
      .toArray();
  }

  async __updateStatus(
    projectStatus: StarterProjectStatus,
    keyOnProject: string,
    status: AIStatus,
  ): Promise<StarterProjectStatus> {
    const updated = {
      ...projectStatus,
      [keyOnProject]: status,
      updatedAt: new Date(),
    };
    await this.db.starterProjectStatuses.put(
      updated as StarterProjectStatus & { id: string; projectId: string },
    );
    return updated;
  }

  async updateStatus(
    project: StarterProject,
    keyOnProject: string,
    status: AIStatus,
  ): Promise<StarterProjectStatus> {
    project.projectStatus[keyOnProject] = status;

    return await this.__updateStatus(
      project.projectStatus,
      keyOnProject,
      status,
    );
  }

  async getStatus(id: string): Promise<StarterProjectStatus> {
    return await this.db.starterProjectStatuses
      .where("projectId")
      .equals(id)
      .first();
  }

}
