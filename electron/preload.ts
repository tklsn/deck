import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronMeta", {
  platform: process.platform,
  versions: {
    chrome: process.versions.chrome,
    electron: process.versions.electron,
    node: process.versions.node,
  },
});

// Exposes OS-backed encryption to the renderer. Keys never leave the process
// unencrypted — only the encrypted base64 blob is stored in localStorage.
contextBridge.exposeInMainWorld("electronAPI", {
  encryptString: (plaintext: string): Promise<string> =>
    ipcRenderer.invoke("safe-storage:encrypt", plaintext),
  decryptString: (ciphertext: string): Promise<string> =>
    ipcRenderer.invoke("safe-storage:decrypt", ciphertext),
  // Performs HTTP GET via the main process (Node.js) to bypass CORS restrictions.
  getJson: (url: string, headers: Record<string, string>): Promise<unknown> =>
    ipcRenderer.invoke("http:get-json", url, headers),
  // Updates the native title bar overlay colors for per-project frame customization.
  setTitleBarOverlay: (opts: { color: string; symbolColor: string }): Promise<void> =>
    ipcRenderer.invoke("frame:set-overlay", opts),
});
