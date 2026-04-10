import type { LLMSToolsEnginePort } from "../../ports/UtilsAndLLMs/LLMsToolsEnginePort";

function handleRequiredObject(
  properties: object,
  required?: string[],
): Record<string, any> {
  if (required && required.length === 0) {
    return {
      type: "object",
      properties: properties,
    };
  }
  return {
    type: "object",
    properties: properties,
    required: required,
  };
}

function handleProperties(
  properties: Record<string, any>,
  required?: string[],
): Record<string, any> {
  if (typeof properties === "object") {
    if (Array.isArray(properties)) {
      return {
        type: "array",
        items: handleProperties(properties[0], required),
      };
    } else {
      const propertiesKeys = Object.keys(properties);
      const _required =
        required && required.filter((key) => propertiesKeys.includes(key));
      const propertiesObject = propertiesKeys.reduce(
        (acc: Record<string, any>, key) => {
          acc[key] = handleProperties(properties[key], required);

          return acc;
        },
        {},
      );
      return handleRequiredObject(propertiesObject, _required);
    }
  }
  if (typeof properties === "string") {
    return { type: "string" };
  }

  return { type: properties };
}

function getAllKeys(obj: Record<string, any>): string[] {
  const keys = Object.keys(obj);

  return keys.reduce<string[]>((acc, key) => {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      const nestedKeys = getAllKeys(obj[key]);
      return [...acc, key, ...nestedKeys];
    } else {
      return [...acc, key];
    }
  }, []);
}

export function handleTool(
  tool: object,
  name: string,
  description: string,
  required?: string[] | boolean,
) {
  if (typeof required !== "boolean") {
    return {
      name,
      description,
      parameters: handleProperties(tool, required),
    };
  } else {
    return {
      name,
      description,
      parameters: handleProperties(tool, getAllKeys(tool)),
    };
  }
}

export class TKLSNToolEngineAdapter implements LLMSToolsEnginePort {
  constructor() {}

  handleFunction({
    description,
    name,
    tool,
    required,
  }: {
    description: string;
    name: string;
    tool: object;
    required: string[];
  }) {
    return handleTool(tool, name, description, required);
  }
}
