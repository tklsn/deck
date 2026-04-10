import electronPath from "electron";
import { spawn, spawnSync } from "node:child_process";
import process from "node:process";
import { createServer } from "vite";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("pnpm", ["exec", "tsc", "-p", "tsconfig.electron.json"]);

const server = await createServer({
  configFile: "vite.config.ts",
});

await server.listen();

const localUrl = server.resolvedUrls?.local?.[0] ?? "http://localhost:5173";

const electronProcess = spawn(electronPath, ["."], {
  stdio: "inherit",
  env: {
    ...process.env,
    VITE_DEV_SERVER_URL: localUrl,
  },
});

electronProcess.once("exit", (code) => {
  void server.close().finally(() => {
    process.exit(code ?? 0);
  });
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    electronProcess.kill(signal);
  });
}
