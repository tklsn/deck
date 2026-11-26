// Ponte entre o @tklsn/generation-core e o IndexedDB (Dexie) do D.E.C.K.
// O pacote gera; este arquivo carrega o projeto do Dexie para o estado do pacote
// e grava de volta cada mudança, no mesmo formato de antes (as telas não mudam).
import {
  DOCUMENT_KINDS,
  createProvider,
  createState,
  exportProject,
  importProject,
  runPipeline,
  type AIStatus,
  type DocumentKind,
  type ExportV1,
  type PipelineOptions,
  type PipelineState,
  type Provider,
  type ProviderName,
} from "@tklsn/generation-core";
import { starterProjectDB as db } from "../database/StarterProjectDB";
import { getApiKey } from "./provider_settings";

// Modelo padrão que o deck usava quando o projeto não tinha modelo (ArtifactPromptRef.model).
const DEFAULT_MODEL = "openai/gpt-4o-mini";
const PROGRESS_FLUSH_MS = 300;
const STATUS_KEYS = [...DOCUMENT_KINDS, "epics"] as const;
const EXTERNAL = ["openai", "anthropic", "openrouter"];

const byCreatedAt = <T extends { createdAt?: Date }>(a: T, b: T) =>
  new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();

/** Lê o projeto do Dexie no formato do pacote. */
export async function loadState(projectId: string): Promise<PipelineState> {
  const project = await db.starterProjects.get(projectId);
  if (!project) throw new Error(`Project with id ${projectId} not found`);

  const status = await db.starterProjectStatuses.where("projectId").equals(projectId).first();
  const epics = (await db.starterProjectEpics.where("projectId").equals(projectId).toArray()).sort(byCreatedAt);

  const state = createState({
    id: project.id,
    title: project.title,
    prompt: project.prompt,
    language: project.lang,
    provider: project.provider,
    model: project.model,
  });
  state.createdAt = new Date(project.createdAt ?? Date.now()).toISOString();

  for (const kind of DOCUMENT_KINDS) {
    if (project[kind]) state.documents[kind] = project[kind];
  }
  for (const key of STATUS_KEYS) {
    if (status?.[key]) state.status[key] = status[key];
  }

  for (const epic of epics) {
    const epicStatus = await db.starterProjectEpicStatuses.where("epicId").equals(epic.id).first();
    const stories = (await db.starterProjectUserStories.where("epicId").equals(epic.id).toArray()).sort(byCreatedAt);
    state.epics.push({
      id: epic.id,
      name: epic.name,
      description: epic.description,
      features: epic.features ?? [],
      ...(epic.bdd ? { bdd: epic.bdd } : {}),
      status: {
        ...(epicStatus?.bdd ? { bdd: epicStatus.bdd } : {}),
        ...(epicStatus?.userStories ? { userStories: epicStatus.userStories } : {}),
      },
      userStories: stories.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        acceptanceCriteria: s.acceptanceCriteria,
        subtasks: s.subtasks,
      })),
    });
  }
  return state;
}

/**
 * Grava o estado no Dexie. Projeto já existente: só o conteúdo gerado e os status
 * (título, prompt, provedor e modelo continuam os do registro, que o usuário pode
 * ter mudado durante a geração). Histórias mantêm campos que o usuário editou (status).
 */
export async function saveState(state: PipelineState, userId = "local"): Promise<void> {
  const tables = [
    db.starterProjects,
    db.starterProjectStatuses,
    db.starterProjectEpics,
    db.starterProjectEpicStatuses,
    db.starterProjectUserStories,
  ];
  await db.transaction("rw", tables, async () => {
    const now = new Date();
    const existing = await db.starterProjects.get(state.id);

    const docs: Partial<Record<DocumentKind, string>> = {};
    for (const kind of DOCUMENT_KINDS) {
      const value = state.documents[kind];
      // Em DOING o campo guarda o texto parcial do streaming; não apaga.
      if (value !== undefined) docs[kind] = value;
      else if (state.status[kind] === "DOING" && existing?.[kind]) docs[kind] = existing[kind];
    }
    const { expandedPrompt: _a, requirementDocument: _b, projectPlan: _c, projectScope: _d, projectArchitecture: _e, ...base } =
      existing ?? {
        id: state.id,
        userId,
        title: state.title,
        prompt: state.prompt,
        lang: state.language,
        provider: state.provider,
        model: state.model,
        createdAt: new Date(state.createdAt),
      };
    await db.starterProjects.put({ ...base, ...docs, updatedAt: now });

    const status = await db.starterProjectStatuses.where("projectId").equals(state.id).first();
    await db.starterProjectStatuses.put({
      ...status,
      ...(state.status as Record<string, AIStatus>),
      id: status?.id ?? crypto.randomUUID(),
      projectId: state.id,
      createdAt: status?.createdAt ?? now,
      updatedAt: now,
    });

    // Épicos que não estão mais no estado (ex.: épicos refeitos) saem com status e histórias.
    const keep = new Set(state.epics.map((e) => e.id));
    for (const old of await db.starterProjectEpics.where("projectId").equals(state.id).toArray()) {
      if (keep.has(old.id)) continue;
      await db.starterProjectEpicStatuses.where("epicId").equals(old.id).delete();
      await db.starterProjectUserStories.where("epicId").equals(old.id).delete();
      await db.starterProjectEpics.delete(old.id);
    }

    for (const [i, epic] of state.epics.entries()) {
      const oldEpic = await db.starterProjectEpics.get(epic.id);
      // createdAt crescente preserva a ordem gerada (a listagem ordena por ele).
      const createdAt = oldEpic?.createdAt ?? new Date(now.getTime() + i);
      await db.starterProjectEpics.put({
        id: epic.id,
        projectId: state.id,
        name: epic.name,
        description: epic.description,
        features: epic.features,
        bdd: epic.bdd,
        createdAt,
        updatedAt: now,
      });

      const epicStatus = await db.starterProjectEpicStatuses.where("epicId").equals(epic.id).first();
      await db.starterProjectEpicStatuses.put({
        ...epicStatus,
        id: epicStatus?.id ?? crypto.randomUUID(),
        epicId: epic.id,
        bdd: epic.status.bdd ?? "PENDING",
        userStories: epic.status.userStories ?? "PENDING",
        createdAt: epicStatus?.createdAt ?? now,
        updatedAt: now,
      });

      const oldStories = new Map(
        (await db.starterProjectUserStories.where("epicId").equals(epic.id).toArray()).map((s) => [s.id, s]),
      );
      const storyIds = new Set(epic.userStories.map((s) => s.id));
      for (const id of oldStories.keys()) if (!storyIds.has(id)) await db.starterProjectUserStories.delete(id);
      for (const [j, story] of epic.userStories.entries()) {
        const old = oldStories.get(story.id);
        await db.starterProjectUserStories.put({
          ...old,
          id: story.id,
          epicId: epic.id,
          title: story.title,
          description: story.description,
          acceptanceCriteria: story.acceptanceCriteria,
          subtasks: story.subtasks,
          createdAt: old?.createdAt ?? new Date(now.getTime() + j),
          updatedAt: now,
        });
      }
    }
  });
}

function providerFor(state: PipelineState) {
  const name = (state.provider ?? "ollama") as ProviderName;
  return createProvider({ provider: name, apiKey: EXTERNAL.includes(name) ? getApiKey(name) : null });
}

/**
 * Roda o pipeline do pacote sobre o projeto salvo: continua de onde parou e tenta
 * de novo tudo o que não está em SUCCESS (documentos, épicos, BDD e histórias).
 * Grava no Dexie a cada mudança, e o texto parcial dos documentos a cada 300 ms.
 */
export async function generateProject(projectId: string, provider?: Provider): Promise<PipelineState> {
  const state = await loadState(projectId);

  // Uma fila só para todas as escritas: o parcial nunca passa na frente do resultado final.
  let chain: Promise<void> = Promise.resolve();
  const enqueue = (fn: () => Promise<unknown>) => {
    chain = chain.then(fn).then(() => undefined, console.error);
  };

  const partials = new Map<DocumentKind, string>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const flushPartials = () => {
    timer = undefined;
    const entries = [...partials];
    partials.clear();
    enqueue(async () => {
      for (const [kind, text] of entries) {
        // Só grava se o documento ainda está em geração (senão o final já foi gravado).
        if (state.status[kind] === "DOING") await db.starterProjects.update(projectId, { [kind]: text, updatedAt: new Date() });
      }
    });
  };

  const opts: PipelineOptions = {
    provider: provider ?? providerFor(state),
    model: state.model ?? DEFAULT_MODEL,
    onChange: (s) => {
      const snapshot = structuredClone(s);
      enqueue(() => saveState(snapshot));
    },
    onProgress: (kind, partial, epicId) => {
      if (epicId || !(DOCUMENT_KINDS as string[]).includes(kind)) return;
      partials.set(kind as DocumentKind, partial);
      timer ??= setTimeout(flushPartials, PROGRESS_FLUSH_MS);
    },
  };

  try {
    await runPipeline(state, opts);
  } finally {
    clearTimeout(timer);
    partials.clear();
    enqueue(() => saveState(structuredClone(state)));
    await chain;
  }
  return state;
}

/** JSON versionado do projeto (formato do @tklsn/generation-core). */
export async function exportProjectJson(projectId: string): Promise<ExportV1> {
  return exportProject(await loadState(projectId));
}

/** Importa um export como projeto novo (ids novos). Lança erro claro se o arquivo for inválido. */
export async function importProjectJson(json: unknown, userId = "local"): Promise<string> {
  const state = importProject(json);
  await saveState(state, userId);
  return state.id;
}
