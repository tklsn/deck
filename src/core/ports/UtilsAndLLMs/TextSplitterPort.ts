export interface TextSplitterPort {
  splitText: (text: string) => Promise<string[]>
}
