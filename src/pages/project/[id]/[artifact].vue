<script setup lang="ts">
import ArtifactJsonRenderer from "@/components/ArtifactJsonRenderer.vue";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLiveQuery } from "../../../core/composables/useLiveQuery";
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
// @ts-ignore
const artifactParam = Array.isArray(route.params.artifact)
  ? // @ts-ignore
    route.params.artifact[0]
  : // @ts-ignore
    route.params.artifact;

const projectStatus = useLiveQuery(
  () =>
    starterProjectDB.starterProjectStatuses
      .where("projectId")
      .equals(id)
      .first(),
  null,
);

const VALID_ARTIFACTS = [
  "expandedPrompt",
  "requirementDocument",
  "projectPlan",
  "projectScope",
  "projectArchitecture",
] as const;

type ArtifactKey = (typeof VALID_ARTIFACTS)[number];

const LABELS: Record<ArtifactKey, string> = {
  expandedPrompt: "Contexto Aprimorado",
  requirementDocument: "Documento de Requisitos",
  projectPlan: "Plano do Projeto",
  projectScope: "Escopo do Projeto",
  projectArchitecture: "Arquitetura do Projeto",
};

const isValidArtifact = (VALID_ARTIFACTS as readonly string[]).includes(
  artifactParam,
);
const artifactKey = artifactParam as ArtifactKey;
const label = isValidArtifact ? LABELS[artifactKey] : artifactParam;

const service = new StarterProjectService();

const project = useLiveQuery(
  () => starterProjectDB.starterProjects.get(id),
  null,
);

const content = computed(() => project.value?.[artifactKey] ?? "");

const isStreaming = computed(
  () => projectStatus.value?.[artifactKey] === "DOING",
);

// TODO: reconstruir funcionalidade de edição de artefato
// const editing = ref(false);
// const editValue = ref("");
// const saving = ref(false);

// function startEdit() {
//   editValue.value = content.value;
//   editing.value = true;
// }

// async function saveEdit() {
//   saving.value = true;
//   try {
//     await service.updateProject(id, { [artifactKey]: editValue.value });
//     editing.value = false;
//   } finally {
//     saving.value = false;
//   }
// }
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
          <BreadcrumbLink
            class="cursor-pointer"
            @click="router.push(`/project/${id}`)"
          >
            {{ project?.title ?? "..." }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{{ label }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <p v-if="!isValidArtifact" class="text-destructive">Artefato inválido.</p>

    <template v-else-if="project">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold">{{ label }}</h1>
          <Badge
            v-if="isStreaming"
            variant="secondary"
            class="flex items-center gap-1"
          >
            <Icon icon="lucide:loader" class="h-3 w-3 animate-spin" />
            Gerando...
          </Badge>
        </div>

        <!-- TODO: reconstruir funcionalidade de edição de artefato -->
        <!-- <div class="flex gap-2">
          <template v-if="editing">
            <Button variant="outline" size="sm" @click="editing = false">
              <Icon icon="lucide:x" />
              Cancelar
            </Button>
            <Button size="sm" :disabled="saving" @click="saveEdit">
              <Icon icon="lucide:save" />
              {{ saving ? "Salvando..." : "Salvar" }}
            </Button>
          </template>
          <Button
            v-else-if="!isStreaming"
            variant="outline"
            size="sm"
            @click="startEdit"
          >
            <Icon icon="lucide:pencil" />
            Editar
          </Button>
        </div> -->
      </div>

      <Separator />

      <Card>
        <CardContent class="pt-4">
          <!-- TODO: reconstruir funcionalidade de edição de artefato -->
          <!-- <Textarea
            v-if="editing"
            v-model="editValue"
            class="min-h-[60vh] font-mono text-sm"
          /> -->
          <ArtifactJsonRenderer
            :content="content || '*(aguardando conteúdo...)*'"
          />
        </CardContent>
      </Card>
    </template>

    <p v-else class="text-muted-foreground">Carregando...</p>
  </div>
</template>
