import { app, BrowserWindow, ipcMain, Menu, safeStorage, shell } from "electron";
import pkg from "electron-updater";
const { autoUpdater } = pkg;
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let mainWindow: BrowserWindow | null = null;

function initAutoUpdater() {
  if (!app.isPackaged) {
    return;
  }

  autoUpdater.checkForUpdatesAndNotify();
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "../build/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: !app.isPackaged,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === "https:") {
        void shell.openExternal(url);
      }
    } catch {
      // Ignore invalid URLs and deny creating a new window.
    }
    return { action: "deny" };
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    void mainWindow.loadURL(devServerUrl);
  } else {
    void mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// HTTP proxy for external API calls — bypasses CORS since main process is Node.js
ipcMain.handle(
  "http:get-json",
  async (
    _event,
    url: string,
    headers: Record<string, string>,
  ): Promise<unknown> => {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    return res.json();
  },
);

// Safe storage IPC handlers — encrypt/decrypt API keys using OS keychain
ipcMain.handle("safe-storage:encrypt", (_event, plaintext: string): string => {
  if (!safeStorage.isEncryptionAvailable()) return plaintext;
  return safeStorage.encryptString(plaintext).toString("base64");
});

ipcMain.handle("safe-storage:decrypt", (_event, ciphertext: string): string => {
  if (!safeStorage.isEncryptionAvailable()) return ciphertext;
  return safeStorage.decryptString(Buffer.from(ciphertext, "base64"));
});

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createMainWindow();
  initAutoUpdater();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
