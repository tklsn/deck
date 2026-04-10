import type { AIStatus } from "../AIStatus";

export interface StarterProjectEpicStatus {
  id?: string;
  epicId: string;
  bdd?: AIStatus;
  userStories?: AIStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
