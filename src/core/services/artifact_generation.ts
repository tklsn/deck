import type { FunctionDefinition } from "../types/tool";

type JsonRecord = Record<string, unknown>;

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

export function isStructuredToolResultAcceptable(
  raw: string,
  toolDefinition: FunctionDefinition,
): boolean {
  const parsed = parseJsonObject(raw);
  if (!parsed) return false;
  return isLooseSchemaComplete(parsed, toolDefinition.parameters);
}
