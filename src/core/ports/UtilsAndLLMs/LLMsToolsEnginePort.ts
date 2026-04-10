export interface LLMSToolsEnginePort {
  handleFunction: (input: {
    description: string
    name: string
    tool: object
    required: string[]
  }) => Promise<object> | object
}
