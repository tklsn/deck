import { MockProvider, createState, exampleFromSchema, type MockCall } from "@tklsn/generation-core";
import { beforeEach, describe, expect, it } from "vitest";
import { starterProjectDB as db } from "../database/StarterProjectDB";
import { exportProjectJson, generateProject, importProjectJson, loadState, saveState } from "./generation";

const valid = (call: MockCall, extra: object = {}) =>
  JSON.stringify({ ...(exampleFromSchema(call.tool!.parameters) as object), ...extra });

/** Dois épicos fixos; o resto, JSON válido para a tool pedida. */
const twoEpics = (call: MockCall) =>
  call.tool!.name === "create_epics"
    ? JSON.stringify({
        epics: [
          { name: "A", description: "épico A", features: ["f1"] },
          { name: "B", description: "épico B", features: ["f2"] },
        ],
      })
    : valid(call);

/** Cria um projeto como a tela de criação faz (registro + status PENDING). */
async function newProject(): Promise<string> {
  const state = createState({ title: "App", prompt: "uma ideia", language: "pt-BR", provider: "ollama", model: "llama" });
  for (const k of ["expandedPrompt", "requirementDocument", "projectPlan", "projectScope", "projectArchitecture", "epics"] as const) {
    state.status[k] = "PENDING";
  }
  await saveState(state);
  return state.id;
}

const statusOf = (id: string) => db.starterProjectStatuses.where("projectId").equals(id).first();
const epicsOf = (id: string) => db.starterProjectEpics.where("projectId").equals(id).toArray();

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()));
});

describe("generateProject (pacote + Dexie)", () => {
  it("gera tudo e grava no formato que as telas leem", async () => {
    const id = await newProject();
    await generateProject(id, new MockProvider(twoEpics));

    const project = await db.starterProjects.get(id);
    for (const k of ["expandedPrompt", "requirementDocument", "projectPlan", "projectScope", "projectArchitecture"] as const) {
      expect(project?.[k], k).toBeTruthy();
    }
    expect(await statusOf(id)).toMatchObject({ expandedPrompt: "SUCCESS", projectArchitecture: "SUCCESS", epics: "SUCCESS" });

    const epics = (await epicsOf(id)).sort((a, b) => +a.createdAt! - +b.createdAt!);
    expect(epics.map((e) => e.name)).toEqual(["A", "B"]); // ordem preservada
    for (const epic of epics) {
      expect(epic.bdd).toBeTruthy();
      expect(await db.starterProjectEpicStatuses.where("epicId").equals(epic.id).first()).toMatchObject({ bdd: "SUCCESS", userStories: "SUCCESS" });
      expect(await db.starterProjectUserStories.where("epicId").equals(epic.id).count()).toBeGreaterThan(0);
    }
  });

  it("falha marca FAILURE e limpa o texto parcial; 'Tentar novamente' com outro provedor continua de onde parou", async () => {
    const id = await newProject();
    const failing = new MockProvider((call) => {
      if (call.tool!.name === "generate_project_plan" || call.tool!.name.includes("plan")) throw new Error("sem modelo");
      return twoEpics(call);
    });
    await generateProject(id, failing);

    const status = await statusOf(id);
    const failed = Object.entries(status ?? {}).filter(([, v]) => v === "FAILURE").map(([k]) => k);
    expect(failed).toHaveLength(1);
    const project = await db.starterProjects.get(id);
    expect(project?.[failed[0] as "projectPlan"]).toBeFalsy();
    const firstDoc = project?.expandedPrompt;

    const other = new MockProvider(twoEpics);
    await generateProject(id, other); // o que o botão "Tentar novamente" faz
    expect(await statusOf(id)).toMatchObject({ [failed[0]!]: "SUCCESS", epics: "SUCCESS" });
    expect((await db.starterProjects.get(id))?.expandedPrompt).toBe(firstDoc); // não refez o que já estava pronto
    expect(other.calls[0]!.tool!.name).not.toBe("expand_project_description");
  });

  it("'Regenerar tudo' (status PENDING) troca os épicos em vez de duplicar", async () => {
    const id = await newProject();
    await generateProject(id, new MockProvider(twoEpics));
    const oldIds = (await epicsOf(id)).map((e) => e.id);

    // o que service.reprocessAll faz antes de chamar a geração
    await db.starterProjectStatuses.where("projectId").equals(id).modify({
      expandedPrompt: "PENDING", requirementDocument: "PENDING", projectPlan: "PENDING",
      projectScope: "PENDING", projectArchitecture: "PENDING", epics: "PENDING",
    });
    await generateProject(id, new MockProvider(twoEpics));

    const epics = await epicsOf(id);
    expect(epics).toHaveLength(2);
    expect(epics.map((e) => e.id).some((x) => oldIds.includes(x))).toBe(false);
    expect(await db.starterProjectEpicStatuses.count()).toBe(2);
  });

  it("mantém o status que o usuário deu às histórias quando gera de novo outra parte", async () => {
    const id = await newProject();
    await generateProject(id, new MockProvider(twoEpics));
    const story = (await db.starterProjectUserStories.toArray())[0]!;
    await db.starterProjectUserStories.update(story.id, { status: "DONE" as never });

    const epicId = story.epicId;
    await db.starterProjectEpicStatuses.where("epicId").equals(epicId).modify({ bdd: "FAILURE" });
    await generateProject(id, new MockProvider(twoEpics));

    expect((await db.starterProjectUserStories.get(story.id))?.status).toBe("DONE");
  });
});

describe("exportar / importar projeto (.json)", () => {
  it("exporta e importa como projeto novo, igual em conteúdo", async () => {
    const id = await newProject();
    await generateProject(id, new MockProvider(twoEpics));
    const before = await loadState(id);

    const file = JSON.stringify(await exportProjectJson(id));
    const newId = await importProjectJson(file);
    expect(newId).not.toBe(id);

    const after = await loadState(newId);
    const strip = (s: object) => JSON.parse(JSON.stringify(s, (k, v) => (k === "id" || k === "originalId" ? undefined : v)));
    expect(strip(after)).toEqual(strip(before));
    expect(await db.starterProjects.count()).toBe(2);
    expect((await db.starterProjects.get(newId))?.userId).toBe("local");
  });

  it("arquivo de versão desconhecida: erro claro e nada gravado", async () => {
    await expect(importProjectJson({ schemaVersion: 999 })).rejects.toThrow(/999.*suportadas: 1/);
    expect(await db.starterProjects.count()).toBe(0);
  });
});
