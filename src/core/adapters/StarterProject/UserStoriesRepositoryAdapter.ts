import { starterProjectDB } from "../../database/StarterProjectDB";
import type { StarterProjectUserStory } from "../../domain/StarterProject/StarterProjectUserStory";
import type { UserStoriesRepositoryPort } from "../../ports/Project/UserStoriesRepositoryPort";

export class UserStoriesRepositoryAdapter implements UserStoriesRepositoryPort<StarterProjectUserStory> {
  private db: typeof starterProjectDB;

  constructor(db: typeof starterProjectDB = starterProjectDB) {
    this.db = db;
  }

  async save(
    userStory: StarterProjectUserStory,
  ): Promise<StarterProjectUserStory> {
    const { id: _, ...rest } = userStory;
    const id = crypto.randomUUID();
    const now = new Date();

    const record = { ...rest, id, createdAt: now, updatedAt: now };
    await this.db.starterProjectUserStories.add(record);
    return record;
  }

  async findById(id: string): Promise<StarterProjectUserStory | null> {
    return (await this.db.starterProjectUserStories.get(id)) ?? null;
  }

  async update(
    userStory: StarterProjectUserStory,
  ): Promise<StarterProjectUserStory> {
    const updated = {
      ...userStory,
      updatedAt: new Date(),
    } as StarterProjectUserStory & { id: string };
    await this.db.starterProjectUserStories.put(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.db.starterProjectUserStories.delete(id);
  }

  async list(): Promise<StarterProjectUserStory[]> {
    return await this.db.starterProjectUserStories.toArray();
  }

  async listByEpicId(epicId: string): Promise<StarterProjectUserStory[]> {
    return await this.db.starterProjectUserStories
      .where("epicId")
      .equals(epicId)
      .toArray();
  }
}
