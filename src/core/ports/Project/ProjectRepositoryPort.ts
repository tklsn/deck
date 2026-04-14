import type { AIStatus } from "../../domain/AIStatus";

export interface ProjectRepositoryPort<B, S> {
  save: (project: B) => Promise<B>;
  findById: (id: string) => Promise<B | null>;
  update: (project: B) => Promise<B>;
  delete: (id: string) => Promise<void> | Promise<B>;
  list: () => Promise<B[]>;
  listByUserId: (userId: string) => Promise<B[]>;
  updateStatus: (
    project: B,
    keyOnProject: string,
    status: AIStatus,
  ) => Promise<S>;
  getStatus: (id: string) => Promise<S>;
}
