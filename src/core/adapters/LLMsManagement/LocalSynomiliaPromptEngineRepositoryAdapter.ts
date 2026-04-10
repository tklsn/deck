import type { Parameters, Prompts } from "../../domain/Prompt";
import type { PromptEngineRepositoryPort } from "../../ports/UtilsAndLLMs/PromptEngineRepositoryPort";
import type { FunctionDefinition } from "../../types/tool";
import promptsData from "../../../../prompts.json";
import { PROMPT_TOOL_DEFINITIONS } from "./LocalSynomiliaToolDefinitions";

interface RawPromptEntry {
  key: string;
  value: string;
}

interface RawPromptValue {
  parameters: Record<string, { type: string }>;
  prompts: {
    header: string;
    loop?: string[];
  };
}

/**
 * Substitutes %{param}% placeholders in a template string.
 */
function interpolate(template: string, params: Record<string, string>): string {
  return template.replace(/%\{(\w+)\}%/g, (_, key: string) => params[key] ?? "");
}

/**
 * Strips markdown output instructions from prompt text.
 * These are no longer needed since structured output is handled by tool calling.
 */
function stripMarkdownInstructions(text: string): string {
  return (
    text
      // Full sentences ordering markdown-only output
      .replace(
        /A resposta deve ser um arquivo em formad[oa] markdown[^.]*\.\s*/gi,
        "",
      )
      .replace(/não quero texto do agente, a resposta deve ser apenas o arquivo\.\s*/gi, "")
      .replace(/Responda em markdown\.\s*/gi, "")
      .replace(/retorne o resultado completo em markdown\.\s*/gi, "")
      // Inline "em (formato )markdown" references
      .replace(/ em formato markdown/gi, "")
      .replace(/ em markdown/gi, "")
      // "devolva em formato markdown" → "devolva"
      .replace(/devolva em formato markdown /gi, "devolva ")
      // Trim repeated blank lines left after removal
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/**
 * Local adapter for the Synomilia prompt engine.
 *
 * Reads prompts directly from the bundled prompts.json. Prompts are stripped of markdown
 * formatting instructions — structured output is enforced via tool calling
 * through getToolDefinition().
 */
export class LocalSynomiliaPromptEngineRepositoryAdapter
  implements PromptEngineRepositoryPort
{
  private readonly registry: Map<string, RawPromptValue>;

  constructor() {
    this.registry = new Map(
      (promptsData as RawPromptEntry[]).map((entry) => [
        entry.key,
        JSON.parse(entry.value) as RawPromptValue,
      ]),
    );
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

    // When a tool definition exists for this prompt, collapse loop steps into
    // the header as format hints and do a single-shot call. Multi-step loops
    // cause the model to generate fragmented JSON across tool calls.
    if (PROMPT_TOOL_DEFINITIONS[promptReference] && entry.prompts.loop?.length) {
      const loopHints = entry.prompts.loop
        .map((step) => stripMarkdownInstructions(interpolate(step, params)))
        .join("\n\n");
      return { header: `${header}\n\n${loopHints}`, loop: undefined };
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

  /**
   * Returns the FunctionDefinition (JSON schema) for structured tool calling
   * for a given prompt key, or undefined if none is registered.
   */
  getToolDefinition(promptReference: string): FunctionDefinition | undefined {
    return PROMPT_TOOL_DEFINITIONS[promptReference];
  }

  /**
   * Returns all registered prompt keys.
   */
  listPromptKeys(): string[] {
    return Array.from(this.registry.keys());
  }
}
