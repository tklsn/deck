<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@iconify/vue";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ExternalLLMModelsAdapter } from "../../../core/adapters/LLMsManagement/ExternalLLMModelsAdapter";
import { LocalLLMModelsAdapter } from "../../../core/adapters/LLMsManagement/LocalLLMModelsAdapter";
import { useLiveQuery } from "../../../core/composables/useLiveQuery";
import { useProjectExport } from "../../../core/composables/useProjectExport";
import { starterProjectDB } from "../../../core/database/StarterProjectDB";
import type { LocalLLMModel } from "../../../core/ports/UtilsAndLLMs/LocalLLMModelsPort";
import type { ExternalLLMProvider } from "../../../core/services/external_llm";
import { getApiKey } from "../../../core/services/provider_settings";
import {
  hasProjectFrameCustomization,
  normalizeProjectFrameForStorage,
  resolveProjectFrame,
  type ProjectFrameTheme,
} from "../../../core/services/project_frame";
import { StarterProjectService } from "../../../core/services/starter_project";

const route = useRoute();
const router = useRouter();
// @ts-ignore
const id = Array.isArray(route.params.id)
  ? // @ts-ignore
    route.params.id[0]
  : // @ts-ignore
    route.params.id;

const service = new StarterProjectService();

const ARTIFACT_KEYS = [
  "expandedPrompt",
  "requirementDocument",
  "projectPlan",
  "projectScope",
  "projectArchitecture",
] as const;

const STATUS_KEYS = [...ARTIFACT_KEYS, "epics"] as const;

const LABELS: Record<string, string> = {
  expandedPrompt: "Contexto Aprimorado",
  requirementDocument: "Documento de Requisitos",
  projectPlan: "Plano do Projeto",
  projectScope: "Escopo do Projeto",
  projectArchitecture: "Arquitetura do Projeto",
  epics: "Épicos",
};

const ICONS: Record<string, string> = {
  expandedPrompt: "lucide:sparkles",
  requirementDocument: "lucide:file-text",
  projectPlan: "lucide:calendar-check",
  projectScope: "lucide:target",
  projectArchitecture: "lucide:layers",
  epics: "lucide:list-checks",
};

const project = useLiveQuery(
  () => starterProjectDB.starterProjects.get(id),
  null,
);

const projectStatus = useLiveQuery(
  () =>
    starterProjectDB.starterProjectStatuses
      .where("projectId")
      .equals(id)
      .first(),
  null,
);

const processingDone = computed(() => {
  if (!projectStatus.value) return false;
  return STATUS_KEYS.every((key) => projectStatus.value![key] === "SUCCESS");
});

const failureCount = computed(() => {
  if (!projectStatus.value) return 0;
  return STATUS_KEYS.filter((key) => projectStatus.value![key] === "FAILURE")
    .length;
});

const currentDoingLabel = computed(() => {
  if (!projectStatus.value) return null;
  const key = STATUS_KEYS.find((k) => projectStatus.value![k] === "DOING");
  return key ? LABELS[key] : null;
});

function getStatusVariant(
  status: string | undefined,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "SUCCESS") return "default";
  if (status === "DOING") return "secondary";
  if (status === "FAILURE") return "destructive";
  return "outline";
}

function getStatusLabel(status: string | undefined): string {
  const labels: Record<string, string> = {
    SUCCESS: "Concluído",
    DOING: "Processando",
    FAILURE: "Falhou",
    PENDING: "Pendente",
  };
  return labels[status ?? "PENDING"] ?? status ?? "Pendente";
}

function handleCardClick(key: string) {
  if (key === "epics") {
    if (projectStatus.value?.epics === "SUCCESS")
      router.push(`/project/${id}/epics`);
  } else if (
    projectStatus.value?.[key as (typeof ARTIFACT_KEYS)[number]] ===
      "SUCCESS" ||
    projectStatus.value?.[key as (typeof ARTIFACT_KEYS)[number]] === "DOING"
  ) {
    router.push(`/project/${id}/${key}`);
  }
}

function isClickable(key: string): boolean {
  if (key === "epics") return projectStatus.value?.epics === "SUCCESS";
  const s = projectStatus.value?.[key as (typeof ARTIFACT_KEYS)[number]];
  return s === "SUCCESS" || s === "DOING";
}

// ─── Settings panel ────────────────────────────────────────────────────────

type ProviderValue = "ollama" | "lmstudio" | "openai" | "anthropic";

const showSettings = ref(false);
const savingSettings = ref(false);

const providers = ref([
  { value: "ollama" as ProviderValue, label: "Ollama", enabled: false },
  { value: "lmstudio" as ProviderValue, label: "LM Studio", enabled: false },
  { value: "openai" as ProviderValue, label: "OpenAI", enabled: false },
  { value: "anthropic" as ProviderValue, label: "Anthropic", enabled: false },
]);

const settingsProvider = ref<ProviderValue>("ollama");
const settingsModel = ref<string>("");
const availableModels = ref<LocalLLMModel[]>([]);
const loadingModels = ref(false);
const detectingProviders = ref(false);
const frameTitle = ref("");
const frameIcon = ref("");
const frameColor = ref("");
const frameTheme = ref<ProjectFrameTheme>("default");

const projectFrame = computed(() => resolveProjectFrame(project.value));
const hasFrameCustomization = computed(() => hasProjectFrameCustomization(project.value));

const previewFrame = computed(() =>
  resolveProjectFrame({
    title: project.value?.title,
    frameTitle: frameTitle.value,
    frameIcon: frameIcon.value,
    frameColor: frameColor.value,
    frameTheme: frameTheme.value,
  }),
);

/**
 * Maps frame theme to top-bar background color.
 */
function frameBarBackgroundColor(frame: { theme: ProjectFrameTheme; color: string }): string | undefined {
  if (frame.theme === "default") return undefined;
  if (frame.theme === "solid") return frame.color;
  // 1a (hex alpha) = ~10% opacity.
  return `${frame.color}1a`;
}

async function tryListModels(
  p: "ollama" | "lmstudio",
): Promise<LocalLLMModel[] | null> {
  try {
    return await new LocalLLMModelsAdapter({ provider: p }).listModels();
  } catch {
    return null;
  }
}

async function loadModels(p: string) {
  loadingModels.value = true;
  availableModels.value = [];
  settingsModel.value = "";
  try {
    let models: LocalLLMModel[];
    if (p === "openai" || p === "anthropic") {
      models = await new ExternalLLMModelsAdapter(p as ExternalLLMProvider, getApiKey(p) ?? "").listModels();
    } else {
      models = await new LocalLLMModelsAdapter({ provider: p as "ollama" | "lmstudio" }).listModels();
    }
    availableModels.value = models;
    if (models.length > 0 && !settingsModel.value) {
      settingsModel.value = models[0]!.id;
    }
  } catch {
    availableModels.value = [];
  } finally {
    loadingModels.value = false;
  }
}

watch(settingsProvider, (newProvider) => {
  loadModels(newProvider);
});

async function openSettings() {
  showSettings.value = true;
  detectingProviders.value = true;

  if (project.value?.provider) {
    settingsProvider.value = project.value.provider as ProviderValue;
  }
  if (project.value?.model) {
    settingsModel.value = project.value.model;
  }

  frameTitle.value = project.value?.frameTitle ?? "";
  frameIcon.value = project.value?.frameIcon ?? "";
  frameColor.value = project.value?.frameColor ?? "";
  frameTheme.value = project.value?.frameTheme ?? "default";

  const [ollamaModels, lmstudioModels] = await Promise.all([
    tryListModels("ollama"),
    tryListModels("lmstudio"),
  ]);

  providers.value.find((p) => p.value === "ollama")!.enabled = ollamaModels !== null;
  providers.value.find((p) => p.value === "lmstudio")!.enabled = lmstudioModels !== null;

  for (const ext of ["openai", "anthropic"] as const) {
    providers.value.find((p) => p.value === ext)!.enabled = getApiKey(ext) !== null;
  }

  detectingProviders.value = false;

  const current = settingsProvider.value;
  if (current === "ollama" && ollamaModels !== null) {
    availableModels.value = ollamaModels;
    if (!settingsModel.value && ollamaModels.length > 0) settingsModel.value = ollamaModels[0]!.id;
  } else if (current === "lmstudio" && lmstudioModels !== null) {
    availableModels.value = lmstudioModels;
    if (!settingsModel.value && lmstudioModels.length > 0) settingsModel.value = lmstudioModels[0]!.id;
  } else {
    await loadModels(current);
  }
}

async function saveSettings() {
  savingSettings.value = true;
  try {
    const framePayload = normalizeProjectFrameForStorage({
      title: frameTitle.value,
      icon: frameIcon.value,
      color: frameColor.value,
      theme: frameTheme.value,
    });
    await service.updateProject(id, {
      provider: settingsProvider.value,
      model: settingsModel.value || undefined,
      ...framePayload,
    });
  } finally {
    savingSettings.value = false;
  }
}

async function saveAndRetry() {
  savingSettings.value = true;
  try {
    const framePayload = normalizeProjectFrameForStorage({
      title: frameTitle.value,
      icon: frameIcon.value,
      color: frameColor.value,
      theme: frameTheme.value,
    });
    await service.updateProject(id, {
      provider: settingsProvider.value,
      model: settingsModel.value || undefined,
      ...framePayload,
    });
    service.handleProject(id);
    showSettings.value = false;
  } finally {
    savingSettings.value = false;
  }
}

async function saveAndReprocessAll() {
  savingSettings.value = true;
  try {
    const framePayload = normalizeProjectFrameForStorage({
      title: frameTitle.value,
      icon: frameIcon.value,
      color: frameColor.value,
      theme: frameTheme.value,
    });
    await service.updateProject(id, {
      provider: settingsProvider.value,
      model: settingsModel.value || undefined,
      ...framePayload,
    });
    await service.reprocessAll(id);
    showSettings.value = false;
  } finally {
    savingSettings.value = false;
  }
}

const { exportProject: exportProjectFn } = useProjectExport();

async function exportProject() {
  if (project.value) await exportProjectFn(project.value);
}
</script>

<template>
  <div class="container mx-auto flex flex-col gap-5 py-5 px-4">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink class="cursor-pointer" @click="router.push('/')"
            >Projetos</BreadcrumbLink
          >
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{{ project?.title ?? "..." }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <template v-if="project">
      <div v-if="hasFrameCustomization" class="rounded-xl border border-border overflow-hidden bg-card">
        <div
          class="flex items-center justify-between px-3 py-2 border-b border-border/80"
          :class="projectFrame.theme === 'solid' ? 'text-white' : ''"
          :style="{
            backgroundColor: frameBarBackgroundColor(projectFrame),
          }"
        >
          <div class="flex items-center gap-2 text-sm font-medium">
            <Icon :icon="projectFrame.icon" class="h-4 w-4" />
            <span>{{ projectFrame.title }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 rounded-full bg-red-400/90" />
            <span class="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
          </div>
        </div>

        <div class="flex items-start justify-between gap-4 p-4">
          <div class="flex flex-col gap-1">
            <h1 class="text-2xl font-bold">{{ project.title }}</h1>
            <p v-if="project.createdAt" class="text-muted-foreground text-sm">
              Criado em
              {{ new Date(project.createdAt).toLocaleDateString("pt-BR") }}
            </p>
            <p class="text-muted-foreground mt-1 text-sm">{{ project.prompt }}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            class="shrink-0"
            @click="showSettings ? (showSettings = false) : openSettings()"
          >
            <Icon icon="lucide:settings" />
            Configurações
          </Button>
        </div>
      </div>
      <div v-else class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-1">
          <h1 class="text-2xl font-bold">{{ project.title }}</h1>
          <p v-if="project.createdAt" class="text-muted-foreground text-sm">
            Criado em
            {{ new Date(project.createdAt).toLocaleDateString("pt-BR") }}
          </p>
          <p class="text-muted-foreground mt-1 text-sm">{{ project.prompt }}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          class="shrink-0"
          @click="showSettings ? (showSettings = false) : openSettings()"
        >
          <Icon icon="lucide:settings" />
          Configurações
        </Button>
      </div>

      <!-- Settings panel -->
      <Card v-if="showSettings" class="border-border">
        <CardHeader class="pb-3">
          <CardTitle class="text-base">Configurações do Projeto</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <p v-if="detectingProviders" class="text-muted-foreground text-sm flex items-center gap-2">
            <Icon icon="lucide:loader" class="h-4 w-4 animate-spin" />
            Detectando provedores disponíveis...
          </p>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium">Provedor de IA</label>
              <Select v-model="settingsProvider" :disabled="detectingProviders">
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar provedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in providers"
                    :key="option.value"
                    :value="option.value"
                    :disabled="!option.enabled"
                  >
                    <span>{{ option.label }}</span>
                    <span
                      v-if="!option.enabled"
                      class="text-muted-foreground ml-1 text-xs"
                      >indisponível</span
                    >
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div
              class="flex flex-col gap-1.5"
            >
              <label class="text-sm font-medium">Modelo</label>
              <Select
                v-model="settingsModel"
                :disabled="loadingModels || availableModels.length === 0"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="m in availableModels"
                    :key="m.id"
                    :value="m.id"
                  >
                    {{ m.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="loadingModels" class="text-muted-foreground text-xs">
                Carregando modelos...
              </p>
              <p
                v-else-if="availableModels.length === 0"
                class="text-muted-foreground text-xs"
              >
                Nenhum modelo encontrado.
              </p>
            </div>
          </div>

          <div class="space-y-3 rounded-lg border border-border/70 p-3">
            <p class="text-sm font-medium">Frame do sistema</p>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium">Título do frame</label>
                <Input v-model="frameTitle" placeholder="Padrão: título do projeto" />
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium">Ícone (Iconify)</label>
                <Input v-model="frameIcon" placeholder="Ex: lucide:monitor" />
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium">Cor do frame</label>
                <Input v-model="frameColor" placeholder="#64748b" />
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium">Tema do frame</label>
                <Select v-model="frameTheme">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Padrão</SelectItem>
                    <SelectItem value="soft">Suave</SelectItem>
                    <SelectItem value="solid">Sólido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div
              class="rounded-md border border-border/70 overflow-hidden"
            >
              <div
                class="flex items-center justify-between px-3 py-2 text-sm"
                :class="previewFrame.theme === 'solid' ? 'text-white' : ''"
                :style="{
                  backgroundColor: frameBarBackgroundColor(previewFrame),
                }"
              >
                <div class="flex items-center gap-2">
                  <Icon :icon="previewFrame.icon" class="h-4 w-4" />
                  <span class="font-medium">{{ previewFrame.title }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                  <span class="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
                  <span class="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
                </div>
              </div>
              <div class="p-3 text-xs text-muted-foreground">
                Pré-visualização do frame customizado para este sistema.
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              :disabled="savingSettings"
              @click="saveSettings"
            >
              Salvar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              :disabled="savingSettings"
              @click="saveAndRetry"
            >
              <Icon icon="lucide:refresh-cw" class="h-4 w-4" />
              Tentar novamente
            </Button>
            <Button
              variant="destructive"
              size="sm"
              :disabled="savingSettings"
              @click="saveAndReprocessAll"
            >
              <Icon icon="lucide:rotate-ccw" class="h-4 w-4" />
              Regenerar tudo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <!-- Error banner -->
      <div
        v-if="failureCount > 0"
        class="bg-destructive/10 border-destructive/30 flex items-center justify-between gap-3 rounded-md border px-4 py-3"
      >
        <div class="flex items-center gap-2 text-sm">
          <Icon icon="lucide:alert-triangle" class="text-destructive h-4 w-4 shrink-0" />
          <span>
            <strong>{{ failureCount }}</strong> artefato{{ failureCount > 1 ? "s" : "" }} falhou{{ failureCount > 1 ? "ram" : "" }}.
          </span>
        </div>
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="service.handleProject(id)"
          >
            <Icon icon="lucide:refresh-cw" class="h-3 w-3" />
            Tentar novamente
          </Button>
          <Button variant="outline" size="sm" @click="openSettings(); showSettings = true">
            <Icon icon="lucide:settings" class="h-3 w-3" />
            Trocar provedor
          </Button>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Status do Processamento</h2>
      </div>

      <div class="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <div
          v-for="key in STATUS_KEYS"
          :key="key"
          :class="[
            'group relative flex aspect-[3/4] flex-col overflow-hidden rounded-xl border bg-card ring-1 shadow-md transition-all duration-200',
            isClickable(key) ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : '',
            projectStatus?.[key] === 'FAILURE'
              ? 'border-destructive/60 ring-destructive/30'
              : projectStatus?.[key] === 'DOING'
              ? 'border-primary/40 ring-primary/20'
              : projectStatus?.[key] === 'SUCCESS'
              ? 'border-border/60 ring-border/20'
              : 'border-border/40 ring-border/10',
            projectStatus?.[key] === 'DOING' ? 'animate-pulse' : '',
          ]"
          @click="handleCardClick(key)"
        >
          <!-- Status badge at top -->
          <div class="flex justify-center pt-3">
            <Badge :variant="getStatusVariant(projectStatus?.[key])" class="text-[10px] px-2 py-0.5">
              {{ getStatusLabel(projectStatus?.[key]) }}
            </Badge>
          </div>

          <!-- Center: icon -->
          <div class="flex flex-1 flex-col items-center justify-center gap-3 px-3 text-center">
            <div
              :class="[
                'flex h-14 w-14 items-center justify-center rounded-full ring-1 transition-colors',
                projectStatus?.[key] === 'FAILURE'
                  ? 'bg-destructive/10 ring-destructive/30'
                  : projectStatus?.[key] === 'DOING'
                  ? 'bg-primary/10 ring-primary/30'
                  : projectStatus?.[key] === 'SUCCESS'
                  ? 'bg-muted/60 ring-border/30 group-hover:bg-primary/10 group-hover:ring-primary/30'
                  : 'bg-muted/40 ring-border/20',
              ]"
            >
              <Icon
                v-if="projectStatus?.[key] === 'FAILURE'"
                icon="lucide:alert-circle"
                class="h-7 w-7 text-destructive"
              />
              <Icon
                v-else-if="projectStatus?.[key] === 'DOING'"
                :icon="ICONS[key]!"
                class="h-7 w-7 text-primary"
              />
              <Icon
                v-else
                :icon="ICONS[key]!"
                :class="[
                  'h-7 w-7 transition-colors',
                  projectStatus?.[key] === 'SUCCESS'
                    ? 'text-muted-foreground group-hover:text-primary'
                    : 'text-muted-foreground/50',
                ]"
              />
            </div>
            <p class="text-xs font-semibold leading-snug tracking-tight text-foreground/80">
              {{ LABELS[key] }}
            </p>
          </div>

          <!-- Base: action for FAILURE or hint for SUCCESS -->
          <div class="flex flex-col items-center gap-1.5 px-3 pb-3">
            <Button
              v-if="projectStatus?.[key] === 'FAILURE'"
              variant="destructive"
              size="sm"
              class="h-7 w-full px-2 text-[10px]"
              @click.stop="service.handleProject(id)"
            >
              <Icon icon="lucide:refresh-cw" class="h-3 w-3" />
              Tentar novamente
            </Button>
            <p v-else-if="isClickable(key)" class="text-muted-foreground flex items-center gap-1 text-[10px]">
              <Icon icon="lucide:eye" class="h-3 w-3" />
              Visualizar
            </p>
            <div v-else class="h-7" />
          </div>
        </div>
      </div>

      <div v-if="processingDone" class="flex gap-2">
        <Button @click="router.push(`/project/${id}/epics`)">
          <Icon icon="lucide:list-checks" />
          Ver Épicos
        </Button>
        <Button variant="outline" @click="exportProject()">
          <Icon icon="lucide:download" />
          Exportar
        </Button>
      </div>

      <p v-else-if="failureCount === 0" class="text-muted-foreground flex items-center gap-2 text-sm">
        <Icon
          v-if="currentDoingLabel"
          icon="lucide:loader"
          class="h-4 w-4 animate-spin"
        />
        <Icon v-else icon="lucide:clock" class="h-4 w-4" />
        {{ currentDoingLabel ? `Processando: ${currentDoingLabel}` : "Aguardando processamento..." }}
        <span class="text-xs">(atualiza automaticamente)</span>
      </p>
    </template>

    <p v-else class="text-muted-foreground">Carregando...</p>
  </div>
</template>
