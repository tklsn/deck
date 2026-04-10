export interface UserStoriesRepositoryPort<B> {
  save: (project: B) => Promise<B>
  findById: (id: string) => Promise<B | null>
  update: (project: B) => Promise<B>
  delete: (id: string) => Promise<void> | Promise<B>
  list: () => Promise<B[]>
  listByEpicId: (epicId: string) => Promise<B[]>
}
