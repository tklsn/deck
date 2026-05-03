import { AnthropicRepositoryAdapter } from "../adapters/LLMsManagement/AnthropicRepositoryAdapter";
import { LocalLLMRepositoryAdapter } from "../adapters/LLMsManagement/LocalLLMRepositoryAdapter";
import { OpenAIRepositoryAdapter } from "../adapters/LLMsManagement/OpenAIRepositoryAdapter";
import { OpenRouterRepositoryAdapter } from "../adapters/LLMsManagement/OpenRouterRepositoryAdapter";
import { LocalSynomiliaPromptEngineRepositoryAdapter } from "../adapters/LLMsManagement/LocalSynomiliaPromptEngineRepositoryAdapter";
import type { LLMSEngineRepositoryPort } from "../ports/UtilsAndLLMs/LLMSEngineRepositoryPort";
import { getApiKey } from "../services/provider_settings";
import { StarterProjectArtifactEngineAdapter } from "../adapters/StarterProject/ArtifactEngineAdapter";
import { StarterEpicArtifactEngineAdapter } from "../adapters/StarterProject/ArtifactEpicEngineAdapter";
import { EpicsRepositoryAdapter } from "../adapters/StarterProject/EpicsRepositoryAdapter";
import { ProjectRepositoryAdapter } from "../adapters/StarterProject/RepositoryAdapter";
import { UserStoriesRepositoryAdapter } from "../adapters/StarterProject/UserStoriesRepositoryAdapter";
import { starterProjectDB } from "../database/StarterProjectDB";
import type { ArtifactResource } from "../domain/ArtifactResource";
import type { StarterProject } from "../domain/StarterProject/StarterProject";
import type { StarterProjectEpic } from "../domain/StarterProject/StarterProjectEpic";
import type { StarterProjectStatus } from "../domain/StarterProject/StarterProjectStatus";
import type { StarterProjectUserStory } from "../domain/StarterProject/StarterProjectUserStory";
import {
  epicFinalTool,
  userStoriesFinalTool,
} from "../tools/StarterProjectToolDeclarations";
import { PROMPT_TOOL_DEFINITIONS } from "../adapters/LLMsManagement/LocalSynomiliaToolDefinitions";
import { CreateStarterProject } from "../usecases/Starter/CreateProject";
import { HandleEpicsBDDS } from "../usecases/Starter/HandleEpicsBDDS";
import { HandleEpicsUserStories } from "../usecases/Starter/HandleEpicsUserStories";
import { HandleStarterProject } from "../usecases/Starter/HandleProject";
import { HandleProjectEpics } from "../usecases/Starter/HandleProjectEpics";
import { GetEpicsByProjectId } from "../usecases/_Project/GetEpicsByProjectId";
import { GetProjectById } from "../usecases/_Project/GetProjectById";
import { GetProjectEpicById } from "../usecases/_Project/GetProjectEpicById";
import { GetUSByEpicId } from "../usecases/_Project/GetUSByEpicId";
import { GetUSById } from "../usecases/_Project/GetUSById";
import { UpdateProjectById } from "../usecases/_Project/UpdateProjectById";

type ProviderValue =
  | "ollama"
  | "lmstudio"
  | "foundry"
  | "openai"
  | "anthropic"
  | "openrouter";

export class StarterProjectService {
  private projectRepository: ProjectRepositoryAdapter;
  private epicsRepository: EpicsRepositoryAdapter;
  private usRepository: UserStoriesRepositoryAdapter;

  private artifactEngine: StarterProjectArtifactEngineAdapter;
  private epicArtifactEngine: StarterEpicArtifactEngineAdapter;
  private promptRepo: LocalSynomiliaPromptEngineRepositoryAdapter;

  private createProjectUseCase: CreateStarterProject;
  private getProjectByIdUseCase: GetProjectById<StarterProject, StarterProjectStatus>;
  private updateProjectByIdUseCase: UpdateProjectById<StarterProject, StarterProjectStatus>;
  private getEpicsByProjectIdUseCase: GetEpicsByProjectId;
  private getProjectEpicByIdUseCase: GetProjectEpicById;
  private getUSByEpicIdUseCase: GetUSByEpicId;
  private getUSByIdUseCase: GetUSById;

  constructor() {
    this.projectRepository = new ProjectRepositoryAdapter();
    this.epicsRepository = new EpicsRepositoryAdapter();
    this.usRepository = new UserStoriesRepositoryAdapter();

    this.artifactEngine = new StarterProjectArtifactEngineAdapter();
    this.epicArtifactEngine = new StarterEpicArtifactEngineAdapter();
    this.promptRepo = new LocalSynomiliaPromptEngineRepositoryAdapter();

    this.createProjectUseCase = new CreateStarterProject(this.projectRepository);
    this.getProjectByIdUseCase = new GetProjectById(this.projectRepository);
    this.updateProjectByIdUseCase = new UpdateProjectById(this.projectRepository);
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
    this._fireHandle(project.id!).catch(console.error);
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

  // ─── public runner methods (called from Web Worker) ───────────────────────

  async runProject(id: string): Promise<void> {
    return this._fireHandle(id);
  }

  async runReprocessBDD(id: string, epicId: string): Promise<void> {
    return this._reprocessBDD(id, epicId);
  }

  async runReprocessUserStories(id: string, epicId: string): Promise<void> {
    return this._reprocessUserStories(id, epicId);
  }

  async runReprocessEpicAll(id: string, epicId: string): Promise<void> {
    await Promise.all([
      this._reprocessBDD(id, epicId),
      this._reprocessUserStories(id, epicId),
    ]);
  }

  async runReprocessAllEpicsArtifacts(id: string): Promise<void> {
    return this._reprocessAllEpicsArtifacts(id);
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

  private _resolveLLMContext(project: { provider?: string; model?: string }): {
    llmRepo: LLMSEngineRepositoryPort;
    effectiveModel: string | undefined;
  } {
    const provider = (project.provider ?? "ollama") as ProviderValue;

    let llmRepo: LLMSEngineRepositoryPort;
    if (provider === "openai") {
      llmRepo = new OpenAIRepositoryAdapter(getApiKey("openai") ?? "");
    } else if (provider === "anthropic") {
      llmRepo = new AnthropicRepositoryAdapter(getApiKey("anthropic") ?? "");
    } else if (provider === "openrouter") {
      llmRepo = new OpenRouterRepositoryAdapter(getApiKey("openrouter") ?? "");
    } else {
      llmRepo = new LocalLLMRepositoryAdapter({
        provider,
        toolCallStrategy: "auto",
      });
    }

    return { llmRepo, effectiveModel: project.model };
  }

  private async _fireHandle(id: string): Promise<void> {
    const project = await this._requireProject(id);
    const { llmRepo, effectiveModel } = this._resolveLLMContext(project);

    const result = await new HandleStarterProject(
      llmRepo,
      this.promptRepo,
      this.projectRepository,
      this.artifactEngine,
    ).execute({ project, model: effectiveModel });

    const artifacts = await this.artifactEngine.getArtifactPromptRef();
    const allDone = artifacts.every(
      (a) => result.projectStatus?.[a.keyOnProject] === "SUCCESS",
    );

    if (allDone) {
      await this._runEpicPipeline(llmRepo, result, project.lang, effectiveModel);
    }
  }

  private async _reprocessBDD(id: string, epicId: string): Promise<void> {
    const project = await this._requireProject(id);
    const { llmRepo } = this._resolveLLMContext(project);
    const epic = await this.epicsRepository.findById(epicId);

    await new HandleEpicsBDDS(llmRepo, this.epicsRepository, this.promptRepo).execute({
      project: [epic],
      artifact: this.epicArtifactEngine.getArtifactPromptRefByKeyOnProject("bdd"),
      toolDefinition: PROMPT_TOOL_DEFINITIONS["sofia:starter:map-bdd"]!,
      lang: project.lang,
      model: project.model,
    });
  }

  private async _reprocessUserStories(id: string, epicId: string): Promise<void> {
    const project = await this._requireProject(id);
    const { llmRepo } = this._resolveLLMContext(project);
    const epic = await this.epicsRepository.findById(epicId);

    await new HandleEpicsUserStories(
      llmRepo,
      this.epicsRepository,
      this.promptRepo,
      this.usRepository,
    ).execute({
      project: [epic],
      artifact: this.epicArtifactEngine.getArtifactPromptRefByKeyOnProject("userStories"),
      toolDefinition: userStoriesFinalTool,
      lang: project.lang,
      model: project.model,
    });
  }

  private async _reprocessAllEpicsArtifacts(id: string): Promise<void> {
    const project = await this._requireProject(id);
    const { llmRepo, effectiveModel } = this._resolveLLMContext(project);
    const epics = await this.getEpicsByProjectIdUseCase.execute(id);

    await Promise.all([
      new HandleEpicsBDDS(llmRepo, this.epicsRepository, this.promptRepo).execute({
        project: epics,
        artifact: this.epicArtifactEngine.getArtifactPromptRefByKeyOnProject("bdd"),
        toolDefinition: PROMPT_TOOL_DEFINITIONS["sofia:starter:map-bdd"]!,
        lang: project.lang,
        model: effectiveModel,
      }),
      new HandleEpicsUserStories(
        llmRepo,
        this.epicsRepository,
        this.promptRepo,
        this.usRepository,
      ).execute({
        project: epics,
        artifact: this.epicArtifactEngine.getArtifactPromptRefByKeyOnProject("userStories"),
        toolDefinition: userStoriesFinalTool,
        lang: project.lang,
        model: effectiveModel,
      }),
    ]);
  }

  private async _runEpicPipeline(
    llmRepo: LLMSEngineRepositoryPort,
    project: StarterProject,
    lang: string,
    model: string | undefined,
  ): Promise<void> {
    const epics = await new HandleProjectEpics(
      llmRepo,
      this.projectRepository,
      this.promptRepo,
      this.epicsRepository,
    ).execute({
      project,
      artifact: this.epicArtifactEngine.getArtifactPromptRefByKeyOnProject("epics"),
      toolDefinition: epicFinalTool,
    });

    await Promise.all([
      new HandleEpicsBDDS(llmRepo, this.epicsRepository, this.promptRepo).execute({
        project: epics,
        artifact: this.epicArtifactEngine.getArtifactPromptRefByKeyOnProject("bdd"),
        toolDefinition: PROMPT_TOOL_DEFINITIONS["sofia:starter:map-bdd"]!,
        lang,
        model,
      }),
      new HandleEpicsUserStories(
        llmRepo,
        this.epicsRepository,
        this.promptRepo,
        this.usRepository,
      ).execute({
        project: epics,
        artifact: this.epicArtifactEngine.getArtifactPromptRefByKeyOnProject("userStories"),
        toolDefinition: userStoriesFinalTool,
        lang,
        model,
      }),
    ]);
  }
}
