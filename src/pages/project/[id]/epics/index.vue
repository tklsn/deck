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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "@iconify/vue";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLiveQuery } from "../../../../core/composables/useLiveQuery";
import type {
  StarterProjectEpicRecord,
  StarterProjectEpicStatusRecord,
} from "../../../../core/database/StarterProjectDB";
import { starterProjectDB } from "../../../../core/database/StarterProjectDB";
import { StarterProjectService } from "../../../../core/services/starter_project";

const route = useRoute();
const router = useRouter();
const service = new StarterProjectService();
// @ts-ignore
const id = Array.isArray(route.params.id)
  ? // @ts-ignore
    route.params.id[0]
  : // @ts-ignore
    route.params.id;

const project = useLiveQuery(
  () => starterProjectDB.starterProjects.get(id),
  null,
);

const epics = useLiveQuery(
  async () => {
    const epicList = await starterProjectDB.starterProjectEpics
      .where("projectId")
      .equals(id)
      .toArray();

    return Promise.all(
      epicList.map(async (epic) => {
        const epicStatus = await starterProjectDB.starterProjectEpicStatuses
          .where("epicId")
          .equals(epic.id)
          .first();
        return { ...epic, epicStatus };
      }),
    );
  },
  [] as (StarterProjectEpicRecord & {
    epicStatus?: StarterProjectEpicStatusRecord;
  })[],
);

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
    SKIPPED: "Ignorado",
  };
  return labels[status ?? "PENDING"] ?? status ?? "Pendente";
}

type EpicWithStatus = StarterProjectEpicRecord & {
  epicStatus?: StarterProjectEpicStatusRecord;
};

function hasEpicFailure(epic: EpicWithStatus): boolean {
  return (
    epic.epicStatus?.bdd === "FAILURE" ||
    epic.epicStatus?.userStories === "FAILURE"
  );
}

const anyEpicFailure = computed(() => epics.value.some(hasEpicFailure));
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
          <BreadcrumbPage>Épicos</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Épicos</h1>
      <Button
        variant="outline"
        size="sm"
        @click="router.push(`/project/${id}`)"
      >
        <Icon icon="lucide:arrow-left" />
        Voltar
      </Button>
    </div>

    <div
      v-if="anyEpicFailure"
      class="bg-destructive/10 border-destructive/30 flex items-center justify-between gap-3 rounded-md border px-4 py-3"
    >
      <div class="flex items-center gap-2 text-sm">
        <Icon
          icon="lucide:alert-triangle"
          class="text-destructive h-4 w-4 shrink-0"
        />
        <span
          >Um ou mais épicos falharam ao gerar BDD ou Histórias de
          Usuário.</span
        >
      </div>
      <Button
        variant="outline"
        size="sm"
        @click="service.reprocessAllEpicsArtifacts(id)"
      >
        <Icon icon="lucide:refresh-cw" class="h-3 w-3" />
        Reprocessar todos
      </Button>
    </div>

    <p v-if="epics.length === 0" class="text-muted-foreground text-sm">
      Nenhum épico gerado ainda.
    </p>

    <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      <Card
        v-for="epic in epics"
        :key="epic.id"
        class="cursor-pointer transition-shadow hover:shadow-md"
        @click="router.push(`/project/${id}/epics/${epic.id}`)"
      >
        <CardHeader>
          <div class="flex items-start justify-between gap-2">
            <CardTitle class="text-base">{{ epic.name }}</CardTitle>
            <Badge variant="outline" class="shrink-0 text-xs uppercase"
              >Épico</Badge
            >
          </div>
          <CardDescription class="line-clamp-2">{{
            epic.description
          }}</CardDescription>
        </CardHeader>
        <CardContent v-if="epic.epicStatus">
          <div class="flex flex-wrap gap-2">
            <div class="flex items-center gap-1 text-xs">
              <span class="text-muted-foreground">BDD:</span>
              <Badge
                :variant="getStatusVariant(epic.epicStatus.bdd)"
                class="text-xs"
              >
                {{ getStatusLabel(epic.epicStatus.bdd) }}
              </Badge>
            </div>
            <div class="flex items-center gap-1 text-xs">
              <span class="text-muted-foreground">US:</span>
              <Badge
                :variant="getStatusVariant(epic.epicStatus.userStories)"
                class="text-xs"
              >
                {{ getStatusLabel(epic.epicStatus.userStories) }}
              </Badge>
            </div>
          </div>
          <Button
            v-if="hasEpicFailure(epic)"
            variant="destructive"
            size="sm"
            class="mt-3 w-full"
            @click.stop="service.reprocessEpicAll(id, epic.id)"
          >
            <Icon icon="lucide:refresh-cw" class="h-3 w-3" />
            Retry BDD/US
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
