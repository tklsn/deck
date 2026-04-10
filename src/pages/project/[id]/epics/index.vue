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
import { useRoute, useRouter } from "vue-router";
import { useLiveQuery } from "../../../../core/composables/useLiveQuery";
import type {
  StarterProjectEpicRecord,
  StarterProjectEpicStatusRecord,
} from "../../../../core/database/StarterProjectDB";
import { starterProjectDB } from "../../../../core/database/StarterProjectDB";

const route = useRoute();
const router = useRouter();
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
        </CardContent>
      </Card>
    </div>
  </div>
</template>
