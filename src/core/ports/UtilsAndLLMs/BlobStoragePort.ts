export interface BlobStoragePort {
  uploadFile: (file: Blob, key: string, type: string) => Promise<string>;
  getFile: (key: string) => Promise<Blob>;
  deleteFile: (key: string) => Promise<void>;
}
