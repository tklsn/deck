interface Window {
  electronAPI: {
    encryptString(plaintext: string): Promise<string>;
    decryptString(ciphertext: string): Promise<string>;
    getJson(url: string, headers: Record<string, string>): Promise<unknown>;
  };
}
