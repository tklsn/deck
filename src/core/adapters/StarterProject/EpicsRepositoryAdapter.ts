import { starterProjectDB } from "../../database/StarterProjectDB";
import type { AIStatus } from "../../domain/AIStatus";
import type { StarterProjectEpic } from "../../domain/StarterProject/StarterProjectEpic";
import type { StarterProjectEpicStatus } from "../../domain/StarterProject/StarterProjectEpicStatus";
import type { EpicsRepositoryPort } from "../../ports/Project/EpicsRepositoryPort";

export class EpicsRepositoryAdapter implements EpicsRepositoryPort<
  StarterProjectEpic,
  StarterProjectEpicStatus
> {
  constructor(private db = starterProjectDB) {}

  async save(epic: StarterProjectEpic): Promise<StarterProjectEpic> {
    const { id: _, userStories: __, epicStatus: ___, ...rest } = epic;
    const id = crypto.randomUUID();
    const now = new Date();

    const record = { ...rest, id, createdAt: now, updatedAt: now };
    await this.db.starterProjectEpics.add(record);

    const epicStatus: StarterProjectEpicStatus = {
      id: crypto.randomUUID(),
      epicId: id,
      bdd: "PENDING",
      userStories: "PENDING",
      createdAt: now,
      updatedAt: now,
    };
    await this.db.starterProjectEpicStatuses.add(
      epicStatus as StarterProjectEpicStatus & { id: string; epicId: string },
    );

    return { ...record, epicStatus };
  }

  async findById(id: string): Promise<StarterProjectEpic | null> {
    const record = await this.db.starterProjectEpics.get(id);
    if (!record) return null;

    const epicStatus = await this.db.starterProjectEpicStatuses
      .where("epicId")
      .equals(id)
      .first();
    const userStories = await this.db.starterProjectUserStories
      .where("epicId")
      .equals(id)
      .toArray();

    return { ...record, epicStatus, userStories };
  }

  async update(epic: StarterProjectEpic): Promise<StarterProjectEpic> {
    const { epicStatus: _, userStories: __, ...rest } = epic;
    const updated = { ...rest, updatedAt: new Date() } as typeof rest & {
      id: string;
    };
    await this.db.starterProjectEpics.put(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const status = await this.db.starterProjectEpicStatuses
      .where("epicId")
      .equals(id)
      .first();
    if (status?.id) {
      await this.db.starterProjectEpicStatuses.delete(status.id);
    }
    await this.db.starterProjectUserStories.where("epicId").equals(id).delete();
    await this.db.starterProjectEpics.delete(id);
  }

  async list(): Promise<StarterProjectEpic[]> {
    return await this.db.starterProjectEpics.toArray();
  }

  async listByProjectId(projectId: string): Promise<StarterProjectEpic[]> {
    const epics = await this.db.starterProjectEpics
      .where("projectId")
      .equals(projectId)
      .toArray();
    return Promise.all(
      epics.map(async (epic) => {
        const epicStatus = await this.db.starterProjectEpicStatuses
          .where("epicId")
          .equals(epic.id)
          .first();
        const userStories = await this.db.starterProjectUserStories
          .where("epicId")
          .equals(epic.id)
          .toArray();
        return { ...epic, epicStatus, userStories };
      }),
    );
  }

  async __updateStatus(
    epicStatus: StarterProjectEpicStatus,

    keyOnEpic: string,
    status: AIStatus,
  ): Promise<StarterProjectEpicStatus> {
    const updated = {
      ...epicStatus,
      [keyOnEpic]: status,
      updatedAt: new Date(),
    };
    await this.db.starterProjectEpicStatuses.put(
      updated as StarterProjectEpicStatus & { id: string; epicId: string },
    );
    return updated;
  }

  async updateStatus(
    epic: StarterProjectEpic,
    keyOnEpic: string,
    status: AIStatus,
  ): Promise<StarterProjectEpicStatus> {
    epic.epicStatus[keyOnEpic] = status;

    return await this.__updateStatus(epic.epicStatus, keyOnEpic, status);
  }

  async getStatus(id: string): Promise<StarterProjectEpicStatus> {
    return await this.db.starterProjectEpicStatuses
      .where("epicId")
      .equals(id)
      .first();
  }
}
