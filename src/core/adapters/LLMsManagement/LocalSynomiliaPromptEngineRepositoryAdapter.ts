import { prompts as promptsData, type PromptEntry } from "../../../../prompts";
import type { Parameters, Prompts } from "../../domain/Prompt";
import type { PromptEngineRepositoryPort } from "../../ports/UtilsAndLLMs/PromptEngineRepositoryPort";
import type { FunctionDefinition } from "../../types/tool";
import { PROMPT_TOOL_DEFINITIONS } from "./LocalSynomiliaToolDefinitions";

function interpolate(template: string, params: Record<string, string>): string {
  return template.replace(
    /%\{(\w+)\}%/g,
    (_, key: string) => params[key] ?? "",
  );
}

function stripMarkdownInstructions(text: string): string {
  return text
    .replace(
      /A resposta deve ser um arquivo em formad[oa] markdown[^.]*\.\s*/gi,
      "",
    )
    .replace(
      /não quero texto do agente, a resposta deve ser apenas o arquivo\.\s*/gi,
      "",
    )
    .replace(/Responda em markdown\.\s*/gi, "")
    .replace(/retorne o resultado completo em markdown\.\s*/gi, "")
    .replace(/ em formato markdown/gi, "")
    .replace(/ em markdown/gi, "")
    .replace(/devolva em formato markdown /gi, "devolva ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export class LocalSynomiliaPromptEngineRepositoryAdapter implements PromptEngineRepositoryPort {
  private readonly registry: Map<string, PromptEntry>;

  constructor() {
    this.registry = new Map(Object.entries(promptsData));
  }

  async getPrompt(
    params: Record<string, string>,
    promptReference: string,
  ): Promise<Prompts> {
    const entry = this.registry.get(promptReference);
    if (!entry) throw new Error(`Prompt not found: ${promptReference}`);

    const header = stripMarkdownInstructions(
      interpolate(entry.prompts.header, params),
    );

    if (PROMPT_TOOL_DEFINITIONS[promptReference]) {
      const detailInstruction =
        "Seja extremamente detalhado e completo em todos os campos. " +
        "Preencha cada campo com profundidade máxima, use exemplos concretos, " +
        "evite respostas genéricas ou ilustrativas. " +
        "Quanto mais informação relevante e específica, melhor. " +
        "Nao devolva objeto parcial, campos vazios, listas vazias ou apenas o titulo da secao.";

      if (entry.prompts.loop?.length) {
        const loopHints = entry.prompts.loop
          .map((step) => stripMarkdownInstructions(interpolate(step, params)))
          .join("\n\n");
        return {
          header: `${header}\n\n${loopHints}\n\n${detailInstruction}`,
          loop: undefined,
        };
      }

      return { header: `${header}\n\n${detailInstruction}`, loop: undefined };
    }

    const loop = entry.prompts.loop?.map((step) =>
      stripMarkdownInstructions(interpolate(step, params)),
    );

    return { header, loop };
  }

  async getParams(promptReference: string): Promise<Parameters> {
    const entry = this.registry.get(promptReference);
    if (!entry) throw new Error(`Prompt not found: ${promptReference}`);
    return entry.parameters as unknown as Parameters;
  }

  getToolDefinition(promptReference: string): FunctionDefinition | undefined {
    return PROMPT_TOOL_DEFINITIONS[promptReference];
  }

  listPromptKeys(): string[] {
    return Array.from(this.registry.keys());
  }
}
