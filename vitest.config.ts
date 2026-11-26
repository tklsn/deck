import path from "node:path";
import { defineConfig } from "vitest/config";

// Config própria: os plugins do vite.config.ts (Vue, router) não são necessários nos testes.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
  test: {
    include: ["src/**/*.test.ts"],
    setupFiles: ["fake-indexeddb/auto"], // IndexedDB em memória para o Dexie
  },
});
