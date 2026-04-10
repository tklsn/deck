export interface Prompt {
  parameters: Parameters
  prompts: Prompts
}

export interface Parameters {
  context: Context
}

export interface GeneralInstructions {
  type: string
}

export interface Context {
  type: string
}

export interface Prompts {
  header: string
  loop?: string[]
}
