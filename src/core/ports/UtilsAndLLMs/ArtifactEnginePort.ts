import type { ArtifactPromptRef } from "../../domain/ArtifactPromptRef";
import type { ArtifactResource } from "../../domain/ArtifactResource";

export interface ArtifactEnginePort<P> {
  // Retorna os artefatos disponíveis para um projeto
  getArtifactResource: (project: P) => Promise<ArtifactResource[]>;
  // Retorna as referências de prompts de artefatos de um projeto
  getArtifactPromptRef: () => Promise<ArtifactPromptRef[]>;
  // Retorna artefatos pela chave no projeto
  getArtifactPromptRefByKeyOnProject: (key: string) => ArtifactPromptRef;
}
