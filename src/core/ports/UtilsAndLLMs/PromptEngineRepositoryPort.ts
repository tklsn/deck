import type { Parameters, Prompts } from '../../domain/Prompt'
import type { FunctionDefinition } from '../../types/tool'

export interface PromptEngineRepositoryPort {
  getPrompt: (
    params: { context: string } & any,
    promptReference: string
  ) => Promise<Prompts>

  getParams: (promptReference: string) => Promise<Parameters>

  getToolDefinition: (promptReference: string) => FunctionDefinition | undefined
}
