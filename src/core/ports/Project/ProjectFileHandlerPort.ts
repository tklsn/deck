export interface ProjectFileHandlerPort<P> {
  appendFileToProject: (fileKey: string, projectId: string) => Promise<P>
  getFilesFromProject: (projectId: string) => Promise<P[]>
}
