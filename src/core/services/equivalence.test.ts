// Equivalência com a geração anterior do D.E.C.K: o pacote precisa montar exatamente
// os mesmos prompts e pedir as mesmas tools, para o mesmo prompt e provedor.
import { DOCUMENT_STEPS, MockProvider, createState, getPrompt, getToolDefinition, listPromptKeys, runPipeline } from "@tklsn/generation-core";
import { describe, expect, it } from "vitest";
import { LocalSynomiliaPromptEngineRepositoryAdapter } from "../adapters/LLMsManagement/LocalSynomiliaPromptEngineRepositoryAdapter";
import { PROMPT_TOOL_DEFINITIONS } from "../adapters/LLMsManagement/LocalSynomiliaToolDefinitions";
import { StarterProjectArtifactEngineAdapter } from "../adapters/StarterProject/ArtifactEngineAdapter";
import { StarterEpicArtifactEngineAdapter } from "../adapters/StarterProject/ArtifactEpicEngineAdapter";
import { epicFinalTool, userStoriesFinalTool } from "../tools/StarterProjectToolDeclarations";
import { langInstruction } from "../usecases/_shared/Common";

describe("equivalência com a geração antiga", () => {
  const old = new LocalSynomiliaPromptEngineRepositoryAdapter();
  const params = { context: "CONTEXTO\n\nCOM VÁRIAS PARTES", general_instructions: langInstruction("en"), lang: "en" };

  it.each(listPromptKeys())("%s: mesmo texto de prompt", async (key) => {
    const before = await old.getPrompt(params, key);
    expect(before.loop).toBeUndefined(); // todos têm tool: o loop vai no header
    expect(getPrompt(key, params)).toBe(before.header);
  });

  it.each(listPromptKeys())("%s: mesma tool definition", (key) => {
    expect(getToolDefinition(key)).toEqual(PROMPT_TOOL_DEFINITIONS[key]);
  });

  it("épicos e histórias usam as mesmas tools finais", async () => {
    // comparamos pelo que o pacote de fato envia ao provedor
    const provider = new MockProvider();
    await runPipeline(createState({ title: "t", prompt: "p", model: "m" }), { provider, retryDelayMs: 0 });
    const tools = provider.calls.map((c) => c.tool!);
    expect(tools.find((t) => t.name === "create_epics")).toEqual(epicFinalTool);
    expect(tools.find((t) => t.name === "create_user_stories")).toEqual(userStoriesFinalTool);
  });

  it("mesma ordem de passos e mesmas entradas (contexto acumulado)", async () => {
    const refs = await new StarterProjectArtifactEngineAdapter().getArtifactPromptRef();
    expect(DOCUMENT_STEPS.map((s) => [s.promptRef, s.kind, s.accumulated])).toEqual(
      refs.map((r) => [r.promptRef, r.keyOnProject, ([] as string[]).concat(r.keyOfInput)]), // "prompt" sozinho = ["prompt"]
    );
    const epicRefs = await new StarterEpicArtifactEngineAdapter().getArtifactPromptRef();
    expect(epicRefs.map((r) => r.promptRef)).toEqual(["sofia:starter:epic-map", "sofia:starter:user-stories", "sofia:starter:map-bdd"]);
  });
});
