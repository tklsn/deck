export interface LocalLLMModel {
  id: string;
  name: string;
}

export interface LocalLLMModelsPort {
  listModels: () => Promise<LocalLLMModel[]>;
}
