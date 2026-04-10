export interface MultiPart {
  data: Buffer
  name?: string
  filename?: string
  type?: string
}
