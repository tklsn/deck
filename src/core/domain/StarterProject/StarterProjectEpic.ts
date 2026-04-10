import type { StarterProjectEpicStatus } from "./StarterProjectEpicStatus";
import type { StarterProjectUserStory } from "./StarterProjectUserStory";

export interface StarterProjectEpic {
  id?: string;
  projectId: string;
  name: string;
  description: string;
  features?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  bdd?: string;
  epicStatus?: StarterProjectEpicStatus;
  userStories?: StarterProjectUserStory[];
}
