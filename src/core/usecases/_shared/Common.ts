export interface UseCase<I, O> {
  execute: (input: I) => Promise<O> | Promise<void>
}
