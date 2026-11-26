import { StarterProjectArtifactEngineAdapter } from "../adapters/StarterProject/ArtifactEngineAdapter";
import { EpicsRepositoryAdapter } from "../adapters/StarterProject/EpicsRepositoryAdapter";
import { ProjectRepositoryAdapter } from "../adapters/StarterProject/RepositoryAdapter";
import { UserStoriesRepositoryAdapter } from "../adapters/StarterProject/UserStoriesRepositoryAdapter";
import { starterProjectDB } from "../database/StarterProjectDB";
import { getApiKey } from "./provider_settings";
import { generateProject } from "./generation";
import type { ArtifactResource } from "../domain/ArtifactResource";
import type { StarterProject } from "../domain/StarterProject/StarterProject";
import type { StarterProjectEpic } from "../domain/StarterProject/StarterProjectEpic";
import type { StarterProjectStatus } from "../domain/StarterProject/StarterProjectStatus";
import type { StarterProjectUserStory } from "../domain/StarterProject/StarterProjectUserStory";
import { CreateStarterProject } from "../usecases/Starter/CreateProject";
import { DeleteProjectById } from "../usecases/_Project/DeleteProjectById";
import { GetEpicsByProjectId } from "../usecases/_Project/GetEpicsByProjectId";
import { GetProjectById } from "../usecases/_Project/GetProjectById";
import { GetProjectEpicById } from "../usecases/_Project/GetProjectEpicById";
import { GetUSByEpicId } from "../usecases/_Project/GetUSByEpicId";
import { GetUSById } from "../usecases/_Project/GetUSById";
import { UpdateProjectById } from "../usecases/_Project/UpdateProjectById";

type ProviderValue = "ollama" | "lmstudio" | "openai" | "anthropic" | "openrouter";

export class StarterProjectService {
  private projectRepository: ProjectRepositoryAdapter;
  private epicsRepository: EpicsRepositoryAdapter;
  private usRepository: UserStoriesRepositoryAdapter;

  private artifactEngine: StarterProjectArtifactEngineAdapter;

  private createProjectUseCase: CreateStarterProject;
  private getProjectByIdUseCase: GetProjectById<StarterProject, StarterProjectStatus>;
  private updateProjectByIdUseCase: UpdateProjectById<StarterProject, StarterProjectStatus>;
  private deleteProjectByIdUseCase: DeleteProjectById<StarterProject, StarterProjectStatus>;
  private getEpicsByProjectIdUseCase: GetEpicsByProjectId;
  private getProjectEpicByIdUseCase: GetProjectEpicById;
  private getUSByEpicIdUseCase: GetUSByEpicId;
  private getUSByIdUseCase: GetUSById;

  constructor() {
    this.projectRepository = new ProjectRepositoryAdapter();
    this.epicsRepository = new EpicsRepositoryAdapter();
    this.usRepository = new UserStoriesRepositoryAdapter();

    this.artifactEngine = new StarterProjectArtifactEngineAdapter();

    this.createProjectUseCase = new CreateStarterProject(this.projectRepository);
    this.getProjectByIdUseCase = new GetProjectById(this.projectRepository);
    this.updateProjectByIdUseCase = new UpdateProjectById(this.projectRepository);
    this.deleteProjectByIdUseCase = new DeleteProjectById(this.projectRepository);
    this.getEpicsByProjectIdUseCase = new GetEpicsByProjectId(this.epicsRepository);
    this.getProjectEpicByIdUseCase = new GetProjectEpicById(this.epicsRepository);
    this.getUSByEpicIdUseCase = new GetUSByEpicId(this.usRepository);
    this.getUSByIdUseCase = new GetUSById(this.usRepository);
  }

  async createProject(
    params: Pick<StarterProject, "prompt" | "title" | "lang" | "userId"> & {
      provider: string;
      model?: string;
    },
  ): Promise<StarterProject> {
    const provider = (params.provider ?? "ollama") as ProviderValue;
    const model = params.model;
    const project = await this.createProjectUseCase.execute({
      ...params,
      provider,
      model,
    });
    generateProject(project.id!).catch(console.error);
    return project;
  }

  async listProjects(userId: string): Promise<StarterProject[]> {
    return this.projectRepository.listByUserId(userId);
  }

  async getProjectById(id: string): Promise<StarterProject> {
    return this.getProjectByIdUseCase.execute(id);
  }

  async updateProject(
    id: string,
    payload: Partial<StarterProject>,
  ): Promise<StarterProject> {
    const current = await this.getProjectByIdUseCase.execute(id);
    return this.updateProjectByIdUseCase.execute({
      id,
      payload: { ...current, ...payload },
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.deleteProjectByIdUseCase.execute({ id });
  }

  // ─── public runner methods (called from Web Worker) ───────────────────────

  // A geração vem do @tklsn/generation-core (ver ./generation.ts). Cada "runner"
  // continua o pipeline e tenta de novo tudo o que não está em SUCCESS, que é o que
  // os botões "Tentar novamente" / "Reprocessar" pedem (eles só aparecem em falhas).
  async runProject(id: string): Promise<void> {
    await generateProject(id);
  }

  async runReprocessBDD(id: string, _epicId: string): Promise<void> {
    await generateProject(id);
  }

  async runReprocessUserStories(id: string, _epicId: string): Promise<void> {
    await generateProject(id);
  }

  async runReprocessEpicAll(id: string, _epicId: string): Promise<void> {
    await generateProject(id);
  }

  async runReprocessAllEpicsArtifacts(id: string): Promise<void> {
    await generateProject(id);
  }

  handleProject(id: string): void {
    this._spawnWorker({ type: "handle", projectId: id });
  }

  async reprocessAll(id: string): Promise<void> {
    await starterProjectDB.starterProjectStatuses
      .where("projectId")
      .equals(id)
      .modify({
        expandedPrompt: "PENDING",
        requirementDocument: "PENDING",
        projectPlan: "PENDING",
        projectScope: "PENDING",
        projectArchitecture: "PENDING",
        epics: "PENDING",
      });
    this.handleProject(id);
  }

  async getProjectStatus(id: string): Promise<StarterProjectStatus> {
    return this.projectRepository.getStatus(id);
  }

  async getProjectArtifacts(id: string): Promise<ArtifactResource[]> {
    const project = await this._requireProject(id);
    return this.artifactEngine.getArtifactResource(project);
  }

  async getEpics(id: string): Promise<StarterProjectEpic[]> {
    return this.getEpicsByProjectIdUseCase.execute(id);
  }

  async getEpic(_id: string, epicId: string): Promise<StarterProjectEpic> {
    return this.getProjectEpicByIdUseCase.execute({ epicId });
  }

  async getEpicUserStories(
    _id: string,
    epicId: string,
  ): Promise<StarterProjectUserStory[]> {
    return this.getUSByEpicIdUseCase.execute({ epicId });
  }

  async getUserStory(
    _id: string,
    _epicId: string,
    usId: string,
  ): Promise<StarterProjectUserStory> {
    return this.getUSByIdUseCase.execute({ usId });
  }

  reprocessEpicBDD(id: string, epicId: string): void {
    this._spawnWorker({ type: "reprocess-bdd", projectId: id, epicId });
  }

  reprocessEpicUserStories(id: string, epicId: string): void {
    this._spawnWorker({ type: "reprocess-stories", projectId: id, epicId });
  }

  reprocessEpicAll(id: string, epicId: string): void {
    this._spawnWorker({ type: "reprocess-epic-all", projectId: id, epicId });
  }

  reprocessAllEpicsArtifacts(id: string): void {
    this._spawnWorker({ type: "reprocess-all-epics-artifacts", projectId: id });
  }

  // ─── private helpers ──────────────────────────────────────────────────────

  private _spawnWorker(message: Record<string, unknown>): void {
    const apiKeys: Record<string, string | null> = {
      openai: getApiKey("openai"),
      anthropic: getApiKey("anthropic"),
      openrouter: getApiKey("openrouter"),
    };
    const worker = new Worker(
      new URL("@/workers/project-processor.worker.ts", import.meta.url),
      { type: "module" },
    );
    worker.postMessage({ ...message, apiKeys });
    worker.onmessage = () => worker.terminate();
    worker.onerror = (e) => {
      console.error(e);
      worker.terminate();
    };
  }

  private async _requireProject(id: string): Promise<StarterProject> {
    const project = await this.projectRepository.findById(id);
    if (!project) throw new Error(`Project with id ${id} not found`);
    return project;
  }
}
