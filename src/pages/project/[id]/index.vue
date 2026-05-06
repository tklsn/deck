<script setup lang="ts">
import ProviderModelSelect from "@/components/ProviderModelSelect.vue";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@iconify/vue";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLiveQuery } from "../../../core/composables/useLiveQuery";
import { useProjectExport } from "../../../core/composables/useProjectExport";
import type { ProviderValue } from "../../../core/composables/useProviderModelSelect";
import { starterProjectDB } from "../../../core/database/StarterProjectDB";
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

// ─── Settings modal ────────────────────────────────────────────────────────

const showSettings = ref(false);
const savingSettings = ref(false);
const settingsProvider = ref<ProviderValue | undefined>();
const settingsModel = ref<string>("");

function openSettings() {
  showSettings.value = true;
}

async function saveSettings() {
  savingSettings.value = true;
  try {
    await service.updateProject(id, {
      provider: settingsProvider.value,
      model: settingsModel.value || undefined,
    });
    showSettings.value = false;
  } catch (e) {
    alert(`Erro ao salvar configurações: ${(e as Error).message}`);
  } finally {
    savingSettings.value = false;
  }
}

async function saveAndRetry() {
  savingSettings.value = true;
  try {
    await service.updateProject(id, {
      provider: settingsProvider.value,
      model: settingsModel.value || undefined,
    });
    service.handleProject(id);
    showSettings.value = false;
  } catch (e) {
    alert(`Erro ao salvar e reprocessar: ${(e as Error).message}`);
  } finally {
    savingSettings.value = false;
  }
}

async function saveAndReprocessAll() {
  savingSettings.value = true;
  try {
    await service.updateProject(id, {
      provider: settingsProvider.value,
      model: settingsModel.value || undefined,
    });
    await service.reprocessAll(id);
    showSettings.value = false;
  } catch (e) {
    alert(`Erro ao regenerar: ${(e as Error).message}`);
  } finally {
    savingSettings.value = false;
  }
}

const { exportProject: exportProjectFn } = useProjectExport();

async function exportProject() {
  if (project.value) await exportProjectFn(project.value);
}

async function handleDelete() {
  if (!project.value) return;
  if (
    !window.confirm(
      `Apagar projeto "${project.value.title}"? Essa ação não pode ser desfeita.`,
    )
  ) {
    return;
  }
  await service.deleteProject(id);
  router.push("/");
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
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-1">
          <h1 class="text-2xl font-bold">{{ project.title }}</h1>
          <p v-if="project.createdAt" class="text-muted-foreground text-sm">
            Criado em
            {{ new Date(project.createdAt).toLocaleDateString("pt-BR") }}
          </p>
          <p class="text-muted-foreground mt-1 text-sm">{{ project.prompt }}</p>
        </div>
        <div class="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" @click="openSettings">
            <Icon icon="lucide:settings" />
            Configurações
          </Button>
          <Button variant="destructive" size="sm" @click="handleDelete">
            <Icon icon="lucide:trash-2" />
            Apagar
          </Button>
        </div>
      </div>

      <Dialog v-model:open="showSettings">
        <DialogContent class="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurações do Projeto</DialogTitle>
            <DialogDescription>
              Trocar provedor e modelo de IA do projeto.
            </DialogDescription>
          </DialogHeader>
          <ProviderModelSelect
            v-if="showSettings"
            v-model:provider="settingsProvider"
            v-model:model="settingsModel"
            auto-detect
            :initial-provider="(project?.provider as ProviderValue | undefined)"
            :initial-model="project?.model"
          />
          <DialogFooter>
            <Button
              variant="outline"
              :disabled="savingSettings"
              @click="saveSettings"
            >
              Salvar
            </Button>
            <Button
              variant="secondary"
              :disabled="savingSettings"
              @click="saveAndRetry"
            >
              <Icon icon="lucide:refresh-cw" class="h-4 w-4" />
              Tentar novamente
            </Button>
            <Button
              variant="destructive"
              :disabled="savingSettings"
              @click="saveAndReprocessAll"
            >
              <Icon icon="lucide:rotate-ccw" class="h-4 w-4" />
              Regenerar tudo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          <Button variant="outline" size="sm" @click="openSettings">
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
