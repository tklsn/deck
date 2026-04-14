import type { ArtifactPromptRef } from "../../domain/ArtifactPromptRef";
import type { ArtifactResource } from "../../domain/ArtifactResource";
import type { StarterProject } from "../../domain/StarterProject/StarterProject";
import type { ArtifactEnginePort } from "../../ports/UtilsAndLLMs/ArtifactEnginePort";

export class StarterProjectArtifactEngineAdapter implements ArtifactEnginePort<StarterProject> {
  private _artifactsResources: ArtifactResource[] = [
    {
      title: "Contexto Aprimorado",
      description:
        "Expandimos o contexto da sua ideia de forma a tornar mais objetiva a jornada no ciclo de desenvolvimento de software.",
      endpoint: "/context-enhanced",
      statusKey: "expandedPrompt",
    },
    {
      title: "Documento de Requisitos",
      description:
        "Utilizamos o contexto aprimorado da sua ideia para listar uma série de requisitos que devem ser atendidos para o desenvolvimento do seu software.",
      endpoint: "/requirements",
      statusKey: "requirementDocument",
    },
    {
      title: "Plano do Projeto",
      description:
        "Um plano estruturado de desenvolvimento com fases, entregas e estimativas baseado nos requisitos do seu software.",
      endpoint: "/project-plan",
      statusKey: "projectPlan",
    },
    {
      title: "Escopo do Projeto",
      description:
        "Delimitação clara do escopo do projeto, definindo o que está dentro e fora do desenvolvimento planejado.",
      endpoint: "/project-scope",
      statusKey: "projectScope",
    },
    {
      title: "Arquitetura do Projeto",
      description:
        "Proposta de arquitetura técnica do software, incluindo tecnologias, padrões e estrutura de componentes.",
      endpoint: "/project-architecture",
      statusKey: "projectArchitecture",
    },
  ];

  private _artifactsPromptRef: ArtifactPromptRef[] = [
    {
      promptRef: "sofia:starter:expand-prompt",
      model: "openai/gpt-4o-mini",
      keyOfInput: "prompt",
      keyOnProject: "expandedPrompt",
      rag: "sofia:starter:expand-prompt:rag-input",
    },
    {
      promptRef: "sofia:starter:requirement-document",
      model: "openai/gpt-4o-mini",
      keyOfInput: ["prompt", "expandedPrompt"],
      keyOnProject: "requirementDocument",
      rag: "sofia:starter:requirement-document:rag-input",
    },
    {
      promptRef: "sofia:starter:project-plan",
      model: "openai/gpt-4o-mini",
      keyOfInput: ["prompt", "expandedPrompt", "requirementDocument"],
      keyOnProject: "projectPlan",
      rag: "sofia:starter:project-plan:rag-input",
    },
    {
      promptRef: "sofia:starter:project-scope",
      model: "openai/gpt-4o-mini",
      keyOfInput: ["prompt", "expandedPrompt", "requirementDocument", "projectPlan"],
      keyOnProject: "projectScope",
      rag: "sofia:starter:project-scope:rag-input",
    },
    {
      promptRef: "sofia:starter:project-architecture",
      model: "openai/gpt-4o-mini",
      keyOfInput: ["prompt", "expandedPrompt", "requirementDocument", "projectPlan", "projectScope"],
      keyOnProject: "projectArchitecture",
      rag: "sofia:starter:project-architecture:rag-input",
    },
  ];

  async getArtifactResource(
    project: StarterProject,
  ): Promise<ArtifactResource[]> {
    const artifactsResourcesInProject: ArtifactResource[] = [];

    for (const artifactResource of this._artifactsResources) {
      if (project[artifactResource.statusKey]) {
        artifactsResourcesInProject.push(artifactResource);
      }
    }

    return artifactsResourcesInProject;
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
