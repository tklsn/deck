import type { AIStatus } from "../AIStatus";
import type { ProjectStatusBase } from "../Project/ProjectStatusBase";

export interface StarterProjectStatus extends ProjectStatusBase {
  projectArchitecture?: AIStatus;
  projectScope?: AIStatus;
  projectPlan?: AIStatus;
  expandedPrompt?: AIStatus;
  requirementDocument?: AIStatus;
  epics?: AIStatus;
}
