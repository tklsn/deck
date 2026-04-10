import type { AIStatus } from "../../domain/AIStatus";
import type { ArtifactResource } from "../../domain/ArtifactResource";

export interface AIDesignStepRepositoryPort<T, S> {
  save: (step: T) => Promise<T>;
  findById: (id: string) => Promise<T | null>;
  update: (step: T) => Promise<T>;
  delete: (id: string) => Promise<void> | Promise<T>;
  list: () => Promise<T[]>;
  findByProjectId: (projectId: string) => Promise<T>;
  updateStatus: (
    stepStatus: T,
    keyOnStep: string,
    status: AIStatus,
  ) => Promise<S>;
  getStatus: (id: string) => Promise<S>;
  getResources?: (id: string) => Promise<ArtifactResource[]>;
}
