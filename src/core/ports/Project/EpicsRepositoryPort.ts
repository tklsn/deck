import type { AIStatus } from "../../domain/AIStatus";
import type { ArtifactResource } from "../../domain/ArtifactResource";

export interface EpicsRepositoryPort<B, S> {
  save: (project: B) => Promise<B>;
  findById: (id: string) => Promise<B | null>;
  update: (project: B) => Promise<B>;
  delete: (id: string) => Promise<void> | Promise<B>;
  list: () => Promise<B[]>;
  listByProjectId: (userId: string) => Promise<B[]>;
  updateStatus: (
    epic: B,
    keyOnEpic: string,
    status: AIStatus,
  ) => Promise<S>;
  getStatus: (id: string) => Promise<S>;
  getResources?: (id: string) => Promise<ArtifactResource[]>;
}
