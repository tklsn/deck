// Security note: API keys are received via postMessage from the renderer process.
// They are sourced from the OS-encrypted storage (safeStorage) and decrypted in
// memory only for the duration of this worker's lifetime. They are never written
// to disk from within this worker.
import { loadApiKeys } from "../core/services/provider_settings";
import { StarterProjectService } from "../core/services/starter_project";

self.onmessage = async (event: MessageEvent) => {
  const { type, projectId, epicId, apiKeys } = event.data;

  if (apiKeys) loadApiKeys(apiKeys);

  const service = new StarterProjectService();
  try {
    if (type === "handle")                       await service.runProject(projectId);
    if (type === "reprocess-bdd")                await service.runReprocessBDD(projectId, epicId);
    if (type === "reprocess-stories")            await service.runReprocessUserStories(projectId, epicId);
    if (type === "reprocess-epic-all")           await service.runReprocessEpicAll(projectId, epicId);
    if (type === "reprocess-all-epics-artifacts") await service.runReprocessAllEpicsArtifacts(projectId);
    self.postMessage({ type: "done" });
  } catch (e) {
    self.postMessage({ type: "error", message: String(e) });
  } finally {
    self.close();
  }
};
