import type { FunctionDefinition } from "../types/tool";

type JsonRecord = Record<string, unknown>;

const FREE_TEXT_FALLBACK_PROMPTS = new Set([
  "sofia:starter:expand-prompt",
  "sofia:starter:requirement-document",
  "sofia:starter:project-plan",
  "sofia:starter:project-scope",
  "sofia:starter:project-architecture",
  "sofia:requirements-module:expand-prompt",
  "sofia:requirements-module:project-scope",
  "sofia:requirements-module:requirement-document",
  "sofia:requirements-module:architecture-document",
  "sofia:aidesign:ideation_gdm",
  "sofia:aidesign:ideation_pdm",
  "sofia:aidesign:ideation_rpm",
  "sofia:aidesign:ideation_sim",
  "sofia:aidesign:immersion_dim",
  "sofia:aidesign:immersion_dsm",
  "sofia:aidesign:immersion_pgm",
  "sofia:aidesign:production_cmplm",
  "sofia:aidesign:production_cntlm",
  "sofia:aidesign:production_ctxlm",
  "sofia:aidesign:production_dlm",
  "sofia:aidesign:production_mttm",
  "sofia:aidesign:validation_dpm",
  "sofia:aidesign:validation_gdep",
  "sofia:aidesign:validation_sim",
]);

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function parseJsonObject(raw: string): JsonRecord | null {
  const trimmed = raw.trim();
  const candidates = [trimmed];
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (match && match[0] !== trimmed) candidates.push(match[0]);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as JsonRecord;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function isMeaningfulString(value: unknown, minimumLength = 12): boolean {
  return typeof value === "string" && normalizeText(value).length >= minimumLength;
}

function isLooseSchemaComplete(value: unknown, schema: Record<string, unknown> | undefined): boolean {
  if (!schema || typeof schema !== "object") {
    if (typeof value === "string") return isMeaningfulString(value, 4);
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined;
  }

  const type = schema.type;

  if (type === "string") {
    return typeof value === "string" && normalizeText(value).length > 0;
  }

  if (type === "array") {
    if (!Array.isArray(value) || value.length === 0) return false;
    const itemSchema =
      schema.items && typeof schema.items === "object"
        ? (schema.items as Record<string, unknown>)
        : undefined;
    return value.some((item) => isLooseSchemaComplete(item, itemSchema));
  }

  if (type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const record = value as JsonRecord;
    const properties =
      schema.properties && typeof schema.properties === "object"
        ? (schema.properties as Record<string, Record<string, unknown>>)
        : {};
    const required = Array.isArray(schema.required)
      ? schema.required.filter((item): item is string => typeof item === "string")
      : [];

    return required.every((key) => isLooseSchemaComplete(record[key], properties[key]));
  }

  return value !== null && value !== undefined;
}

function hasMeaningfulObjectEntries(
  items: unknown,
  requiredKeys: string[],
  minItems: number,
): boolean {
  if (!Array.isArray(items) || items.length < minItems) return false;
  return items.filter((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;
    return requiredKeys.every((key) => isMeaningfulString((item as JsonRecord)[key]));
  }).length >= minItems;
}

function hasMeaningfulStringItems(items: unknown, minItems: number, minLength = 12): boolean {
  return Array.isArray(items)
    && items.filter((item) => isMeaningfulString(item, minLength)).length >= minItems;
}

function isExpandedPromptAcceptable(obj: JsonRecord): boolean {
  return isMeaningfulString(obj.overview, 120)
    && hasMeaningfulObjectEntries(obj.features, ["name", "description"], 3)
    && hasMeaningfulStringItems(obj.flows, 1, 24)
    && Array.isArray(obj.suggestions);
}

function isRequirementsAcceptable(obj: JsonRecord): boolean {
  return isMeaningfulString(obj.section_title, 4)
    && hasMeaningfulObjectEntries(obj.functional_requirements, ["id", "description"], 3)
    && hasMeaningfulObjectEntries(obj.non_functional_requirements, ["id", "description"], 2);
}

function isPlanAcceptable(obj: JsonRecord): boolean {
  return isMeaningfulString(obj.section_title, 4)
    && isMeaningfulString(obj.content, 120)
    && hasMeaningfulStringItems(obj.tasks, 3, 16)
    && hasMeaningfulStringItems(obj.deliverables, 2, 12)
    && hasMeaningfulStringItems(obj.milestones, 2, 12);
}

function isScopeAcceptable(obj: JsonRecord): boolean {
  return isMeaningfulString(obj.section_title, 4)
    && isMeaningfulString(obj.content, 120)
    && hasMeaningfulStringItems(obj.in_scope, 2, 12)
    && hasMeaningfulStringItems(obj.out_of_scope, 1, 12)
    && hasMeaningfulStringItems(obj.assumptions, 1, 12);
}

function isArchitectureAcceptable(obj: JsonRecord): boolean {
  return isMeaningfulString(obj.section_title, 4)
    && isMeaningfulString(obj.content, 120)
    && hasMeaningfulObjectEntries(obj.components, ["name", "description", "technology"], 2)
    && hasMeaningfulStringItems(obj.decisions, 2, 16);
}

function isCanvasAcceptable(obj: JsonRecord): boolean {
  return isMeaningfulString(obj.section_title, 4)
    && isMeaningfulString(obj.content, 120)
    && hasMeaningfulObjectEntries(obj.items, ["label", "value"], 3);
}

export function isLikelySmallLocalModel(model: string | undefined): boolean {
  if (!model) return false;
  const normalized = model.toLowerCase();
  if (/(?:^|[^a-z0-9.])[0-9]+m(?![a-z0-9])/.test(normalized)) return true;
  const match = normalized.match(
    /(?:^|[^a-z0-9.])([0-9]+(?:\.[0-9]+)?)b(?![a-z0-9])/,
  );
  if (!match) return false;
  const size = match[1];
  if (!size) return false;
  return parseFloat(size) <= 4;
}

export function buildArtifactTextFallbackPrompt(header: string): string {
  return `${header}

Se a estruturacao JSON falhar, responda em texto livre com conteudo completo e substancial.
Nao devolva objeto parcial, placeholders, nem apenas titulo.
Entregue um documento em markdown com secoes claras, detalhes concretos e listas quando fizer sentido.`;
}

export function supportsFreeTextArtifactFallback(promptRef: string): boolean {
  return FREE_TEXT_FALLBACK_PROMPTS.has(promptRef);
}

export function isStructuredToolResultAcceptable(
  raw: string,
  toolDefinition: FunctionDefinition,
): boolean {
  const parsed = parseJsonObject(raw);
  if (!parsed) return false;
  return isLooseSchemaComplete(parsed, toolDefinition.parameters);
}

export function isArtifactResultAcceptable(
  raw: string,
  promptRef: string,
  toolDefinition: FunctionDefinition,
): boolean {
  const parsed = parseJsonObject(raw);
  if (!parsed || !isStructuredToolResultAcceptable(raw, toolDefinition)) return false;

  if (promptRef.includes("expand-prompt")) return isExpandedPromptAcceptable(parsed);
  if (promptRef.includes("requirement-document")) return isRequirementsAcceptable(parsed);
  if (promptRef.includes("project-plan")) return isPlanAcceptable(parsed);
  if (promptRef.includes("project-scope")) return isScopeAcceptable(parsed);
  if (promptRef.includes("architecture")) return isArchitectureAcceptable(parsed);
  if (promptRef.includes("aidesign:")) return isCanvasAcceptable(parsed);

  return true;
}

export function isFallbackTextAcceptable(text: string): boolean {
  const normalized = normalizeText(text);
  if (normalized.length < 240) return false;
  return /[#*\-\n.:;]/.test(text) || text.split("\n").filter(Boolean).length >= 3;
}
