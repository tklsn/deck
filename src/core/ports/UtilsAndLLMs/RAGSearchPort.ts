export interface RAGSearchPort<R> {
  search: (
    key: string,
    query: number[],
    projectId: string,
    candidates?: number,
    limit?: number
  ) => Promise<R[]>
}
