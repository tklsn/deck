import type { TaskStatus } from "../TaskStatus";

export interface StarterProjectUserStory {
  id?: string;
  title: string;
  description: string;
  acceptanceCriteria?: string;
  subtasks?: string[];
  status?: TaskStatus;
  epicId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
