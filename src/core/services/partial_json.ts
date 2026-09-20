type JsonRecord = Record<string, unknown>;

interface Comma {
  index: number;
  stack: string;
}

function close(text: string, stack: string, inString: boolean): unknown {
  let out = text;
  if (inString) {
    if (out.endsWith("\\")) out = out.slice(0, -1);
    out += '"';
  }
  out = out.trimEnd();
  if (out.endsWith(",")) out = out.slice(0, -1);
  if (out.endsWith(":")) out += "null";
  for (let i = stack.length - 1; i >= 0; i--) out += stack[i] === "{" ? "}" : "]";
  try {
    return JSON.parse(out);
  } catch {
    return undefined;
  }
}

/**
 * Faz o melhor esforço para ler um JSON objeto ainda incompleto (streaming):
 * fecha strings/objetos/arrays abertos e, se ainda invalido, volta para a
 * ultima virgula segura. Retorna null se nao houver objeto legivel.
 */
export function parsePartialJson(raw: string): JsonRecord | null {
  const text = raw.trim();
  if (!text.startsWith("{")) return null;

  let stack = "";
  let inString = false;
  let escaped = false;
  const commas: Comma[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{" || ch === "[") stack += ch;
    else if (ch === "}" || ch === "]") stack = stack.slice(0, -1);
    else if (ch === ",") commas.push({ index: i, stack });
  }

  const candidates: unknown[] = [close(text, stack, inString)];
  for (let i = commas.length - 1; i >= 0 && candidates[candidates.length - 1] === undefined; i--) {
    const c = commas[i]!;
    candidates.push(close(text.slice(0, c.index), c.stack, false));
  }

  const parsed = candidates.find((c) => c !== undefined);
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as JsonRecord)
    : null;
}
