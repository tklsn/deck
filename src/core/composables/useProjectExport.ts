import type {
  StarterProjectEpicRecord,
  StarterProjectRecord,
  StarterProjectUserStoryRecord,
} from "../database/StarterProjectDB";
import { starterProjectDB } from "../database/StarterProjectDB";

const ARTIFACT_KEYS = [
  "expandedPrompt",
  "requirementDocument",
  "projectPlan",
  "projectScope",
  "projectArchitecture",
] as const;

const ARTIFACT_LABELS: Record<(typeof ARTIFACT_KEYS)[number], string> = {
  expandedPrompt: "Contexto Aprimorado",
  requirementDocument: "Documento de Requisitos",
  projectPlan: "Plano do Projeto",
  projectScope: "Escopo do Projeto",
  projectArchitecture: "Arquitetura do Projeto",
};

const FIELD_LABELS: Record<string, string> = {
  overview: "Visão Geral",
  features: "Funcionalidades",
  flows: "Fluxos do Sistema",
  suggestions: "Sugestões",
  content: "Descrição",
  items: "Itens",
  functional_requirements: "Requisitos Funcionais",
  non_functional_requirements: "Requisitos Não Funcionais",
  tasks: "Tarefas",
  deliverables: "Entregas",
  milestones: "Marcos",
  in_scope: "Dentro do Escopo",
  out_of_scope: "Fora do Escopo",
  assumptions: "Premissas",
  components: "Componentes",
  decisions: "Decisões de Arquitetura",
  points: "Pontos Essenciais",
  questions: "Questões",
  key_concepts: "Conceitos-Chave",
  epics: "Épicos",
  screens: "Telas",
  acceptance_criteria: "Critérios de Aceite",
  stories: "User Stories",
  scenarios: "Cenários",
};

function artifactToMarkdown(content: string, sectionLabel: string): string {
  let body: string;
  try {
    const obj = JSON.parse(content) as Record<string, unknown>;
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      body = content;
    } else {
      const lines: string[] = [];
      if (typeof obj.section_title === "string") lines.push(`### ${obj.section_title}\n`);
      for (const [key, value] of Object.entries(obj)) {
        if (key === "section_title" || value === null || value === "" ||
            (Array.isArray(value) && (value as unknown[]).length === 0)) continue;
        const fieldLabel = FIELD_LABELS[key] ?? key.replace(/_/g, " ");
        lines.push(`\n**${fieldLabel}**\n`);
        if (typeof value === "string") {
          lines.push(value);
        } else if (Array.isArray(value) && (value as unknown[]).every((v) => typeof v === "string")) {
          lines.push((value as string[]).map((v) => `- ${v}`).join("\n"));
        } else if (Array.isArray(value)) {
          for (const item of value as Record<string, unknown>[]) {
            const itemTitle = item.title ?? item.name;
            if (itemTitle) lines.push(`\n#### ${itemTitle}\n`);
            if (item.description) lines.push(String(item.description));
            for (const [subKey, subVal] of Object.entries(item)) {
              if (Array.isArray(subVal) && (subVal as unknown[]).every((v) => typeof v === "string") && (subVal as unknown[]).length > 0) {
                lines.push(`\n_${FIELD_LABELS[subKey] ?? subKey}_\n`);
                lines.push((subVal as string[]).map((v) => `- ${v}`).join("\n"));
              }
            }
          }
        }
      }
      body = lines.join("\n");
    }
  } catch {
    body = content;
  }
  return `## ${sectionLabel}\n\n${body}`;
}

function epicsToMarkdown(
  epics: StarterProjectEpicRecord[],
  userStoriesByEpic: Map<string, StarterProjectUserStoryRecord[]>,
): string {
  const lines: string[] = ["## Épicos"];
  for (const epic of epics) {
    lines.push(`\n### ${epic.name}\n`);
    lines.push(epic.description);
    if (epic.features && epic.features.length > 0) {
      lines.push(`\n**Funcionalidades**\n`);
      lines.push(epic.features.map((f) => `- ${f}`).join("\n"));
    }
    if (epic.bdd) {
      lines.push(`\n**BDD**\n`);
      lines.push(epic.bdd);
    }
    const stories = userStoriesByEpic.get(epic.id) ?? [];
    if (stories.length > 0) {
      lines.push(`\n**User Stories**\n`);
      for (const story of stories) {
        lines.push(`\n#### ${story.title}\n`);
        lines.push(story.description);
        if (story.acceptanceCriteria) {
          lines.push(`\n_Critérios de Aceite_\n`);
          lines.push(story.acceptanceCriteria);
        }
        if (story.subtasks && story.subtasks.length > 0) {
          lines.push(`\n_Subtarefas_\n`);
          lines.push(story.subtasks.map((s) => `- ${s}`).join("\n"));
        }
      }
    }
  }
  return lines.join("\n");
}

export function useProjectExport() {
  async function exportProject(project: StarterProjectRecord) {
    const date = new Date().toLocaleDateString("pt-BR");
    const sections: string[] = [
      `# ${project.title}`,
      `> ${project.prompt}`,
      `\n_Exportado em ${date}_\n`,
      "---",
    ];

    for (const key of ARTIFACT_KEYS) {
      const raw = project[key];
      if (raw) sections.push(artifactToMarkdown(raw, ARTIFACT_LABELS[key]));
    }

    const epics = await starterProjectDB.starterProjectEpics
      .where("projectId")
      .equals(project.id)
      .toArray();

    if (epics.length > 0) {
      const allStories = await starterProjectDB.starterProjectUserStories
        .where("epicId")
        .anyOf(epics.map((e) => e.id))
        .toArray();
      const userStoriesByEpic = new Map<string, StarterProjectUserStoryRecord[]>();
      for (const story of allStories) {
        const list = userStoriesByEpic.get(story.epicId) ?? [];
        list.push(story);
        userStoriesByEpic.set(story.epicId, list);
      }
      sections.push(epicsToMarkdown(epics, userStoriesByEpic));
    }

    const blob = new Blob([sections.join("\n\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/[^a-z0-9]/gi, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return { exportProject };
}
