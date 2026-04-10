import type { LLMsEmbeddingsPort } from "../../ports/UtilsAndLLMs/LLMsEmbeddingsPort";

export class LLMSEmbeddingAdapter implements LLMsEmbeddingsPort {
  private llms_engine: any;

  constructor(llms_engine: any) {
    this.llms_engine = llms_engine;
  }

  async embedText(input: string, model: string): Promise<number[]> {
    return this.llms_engine(`/embeddings/${model}`, {
      method: "POST",
      body: { input },
      timeout: 600000,
    });
  }
}
