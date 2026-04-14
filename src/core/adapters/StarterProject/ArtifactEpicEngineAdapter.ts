import type { ArtifactPromptRef } from "../../domain/ArtifactPromptRef";
import type { ArtifactResource } from "../../domain/ArtifactResource";
import type { StarterProjectEpic } from "../../domain/StarterProject/StarterProjectEpic";
import type { ArtifactEnginePort } from "../../ports/UtilsAndLLMs/ArtifactEnginePort";

export class StarterEpicArtifactEngineAdapter implements ArtifactEnginePort<StarterProjectEpic> {
  private _artifactsPromptRef: ArtifactPromptRef[] = [
    {
      promptRef: "sofia:starter:epic-map",
      model: "openai/gpt-4o-mini",
      keyOfInput: ["prompt", "expandedPrompt", "requirementDocument", "projectPlan", "projectScope", "projectArchitecture"],
      keyOnProject: "epics",
      rag: "",
    },
    {
      promptRef: "sofia:starter:user-stories",
      model: "openai/gpt-4o-mini",
      keyOfInput: ["description", "features", "bdd"],
      keyOnProject: "userStories",
      rag: "",
    },
    {
      promptRef: "sofia:starter:map-bdd",
      model: "openai/gpt-4o-mini",
      keyOfInput: ["description", "features"],
      keyOnProject: "bdd",
      rag: "",
    },
  ];

  async getArtifactResource(
    _project: StarterProjectEpic,
  ): Promise<ArtifactResource[]> {
    return [];
  }

  async getArtifactPromptRef(): Promise<ArtifactPromptRef[]> {
    return this._artifactsPromptRef;
  }

  getArtifactPromptRefByKeyOnProject(key: string): ArtifactPromptRef {
    return this._artifactsPromptRef.find(
      (artifactResource) => artifactResource.keyOnProject === key,
    );
  }
}
