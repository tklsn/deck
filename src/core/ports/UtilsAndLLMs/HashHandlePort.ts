export interface HashHandlePort {
  hash: (data: string) => Promise<string>
}
