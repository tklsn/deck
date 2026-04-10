import type { ProjectBase } from "../Project/ProjectBase";
import type { StarterProjectEpic } from "./StarterProjectEpic";
import type { StarterProjectStatus } from "./StarterProjectStatus";

export interface StarterProject extends ProjectBase<StarterProjectStatus> {
  expandedPrompt?: string;
  requirementDocument?: string;
  projectPlan?: string;
  projectScope?: string;
  projectArchitecture?: string;
  epics?: StarterProjectEpic[];
  provider?: string;
  model?: string;
}
