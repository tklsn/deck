export interface LLMsEmbeddingsPort {
  embedText: (input: string, model: string) => Promise<number[]>
}
