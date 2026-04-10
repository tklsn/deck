export interface ExtractTextFromFilePort {
  extractTextFromFile: (file: Blob) => Promise<string>;
}
