import Dexie, { type EntityTable } from 'dexie';
import type { AIStatus } from '../domain/AIStatus';
import type { TaskStatus } from '../domain/TaskStatus';

export interface StarterProjectRecord {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  lang?: string;
  provider?: string;
  model?: string;
  expandedPrompt?: string;
  requirementDocument?: string;
  projectPlan?: string;
  projectScope?: string;
  projectArchitecture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StarterProjectStatusRecord {
  id: string;
  projectId: string;
  expandedPrompt?: AIStatus;
  requirementDocument?: AIStatus;
  projectPlan?: AIStatus;
  projectScope?: AIStatus;
  projectArchitecture?: AIStatus;
  epics?: AIStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StarterProjectEpicRecord {
  id: string;
  projectId: string;
  name: string;
  description: string;
  features?: string[];
  bdd?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StarterProjectEpicStatusRecord {
  id: string;
  epicId: string;
  bdd?: AIStatus;
  userStories?: AIStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StarterProjectUserStoryRecord {
  id: string;
  epicId: string;
  title: string;
  description: string;
  acceptanceCriteria?: string;
  subtasks?: string[];
  status?: TaskStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export const starterProjectDB = new Dexie('StarterProjectDB') as Dexie & {
  starterProjects: EntityTable<StarterProjectRecord, 'id'>;
  starterProjectStatuses: EntityTable<StarterProjectStatusRecord, 'id'>;
  starterProjectEpics: EntityTable<StarterProjectEpicRecord, 'id'>;
  starterProjectEpicStatuses: EntityTable<StarterProjectEpicStatusRecord, 'id'>;
  starterProjectUserStories: EntityTable<StarterProjectUserStoryRecord, 'id'>;
};

starterProjectDB.version(1).stores({
  starterProjects: 'id, userId',
  starterProjectStatuses: 'id, projectId',
  starterProjectEpics: 'id, projectId',
  starterProjectEpicStatuses: 'id, epicId',
  starterProjectUserStories: 'id, epicId',
});

starterProjectDB.version(2).stores({
  starterProjects: 'id, userId',
  starterProjectStatuses: 'id, &projectId',
  starterProjectEpics: 'id, projectId',
  starterProjectEpicStatuses: 'id, &epicId',
  starterProjectUserStories: 'id, epicId',
});
