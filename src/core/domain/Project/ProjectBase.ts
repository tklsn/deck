export interface ProjectBase<S> {
  id?: string
  projectStatus?: S
  prompt: string
  title: string
  updatedAt?: Date
  userId: string
  createdAt?: Date
  lang?: string
}
