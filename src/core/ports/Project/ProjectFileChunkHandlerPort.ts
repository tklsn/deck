export interface ProjectFileChunkHandlerPort<S> {
  appendChunkToProjectFile: (
    projectId: string,
    projectFileId: string,
    chunkIndex: number,
    chunkData: string
  ) => Promise<S>
  get: (id: string) => Promise<S>
  getByFileId: (fileId: string) => Promise<S[]>
  updateChunkEmbeddings: (chunkId: string, data: number[]) => Promise<S>
}
