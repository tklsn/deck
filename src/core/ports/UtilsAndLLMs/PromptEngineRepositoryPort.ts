import type { Parameters, Prompts } from '../../domain/Prompt'

export interface PromptEngineRepositoryPort {
  getPrompt: (
    params: { context: string } & any,
    promptReference: string
  ) => Promise<Prompts>

  getParams: (promptReference: string) => Promise<Parameters>
}
