import type { FunctionDefinition } from "../types/tool";

export const epicFinalTool: FunctionDefinition = {
  name: "create_epics",
  description: "Criação de épicos",
  parameters: {
    type: "object",
    properties: {
      epics: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            features: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["name", "description", "features"],
        },
      },
    },
    required: ["epics"],
  },
};

export const userStoriesFinalTool: FunctionDefinition = {
  name: "create_user_stories",
  description: "Criação de histórias de usuário",
  parameters: {
    type: "object",
    properties: {
      user_stories: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            acceptanceCriteria: { type: "string" },
            subtasks: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: [
            "title",
            "description",
            "acceptanceCriteria",
            "subtasks",
          ],
        },
      },
    },
    required: ["user_stories"],
  },
};
