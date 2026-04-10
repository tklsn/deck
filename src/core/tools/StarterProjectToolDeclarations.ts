import { TKLSNToolEngineAdapter } from "../adapters/LLMsManagement/LLMSToolEngineAdapter";
import type { FunctionDefinition } from "../types/tool";

const llmsToolEngineRepository = new TKLSNToolEngineAdapter();

export const epicFinalTool: FunctionDefinition =
  llmsToolEngineRepository.handleFunction({
    tool: {
      epics: [{ name: "string", description: "string", features: ["string"] }],
    },
    name: "create_epics",
    description: "Criação de épicos",
    required: ["epics", "name", "description", "features"],
  }) as FunctionDefinition;

export const userStoriesFinalTool: FunctionDefinition =
  llmsToolEngineRepository.handleFunction({
    tool: {
      user_stories: [
        {
          title: "string",
          description: "string",
          acceptanceCriteria: "string",
          subtasks: ["string"],
        },
      ],
    },
    name: "create_user_stories",
    description: "Criação de histórias de usuário",
    required: [
      "user_stories",
      "title",
      "description",
      "acceptanceCriteria",
      "subtasks",
    ],
  }) as FunctionDefinition;
