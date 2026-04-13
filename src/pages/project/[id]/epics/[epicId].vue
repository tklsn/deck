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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@iconify/vue";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLiveQuery } from "../../../../core/composables/useLiveQuery";
import { starterProjectDB } from "../../../../core/database/StarterProjectDB";
import { StarterProjectService } from "../../../../core/services/starter_project";

interface BddScenario {
  title: string;
  given: string[];
  when: string[];
  then: string[];
}

interface BddFeature {
  name: string;
  scenarios: BddScenario[];
}

function parseBdd(raw: string): BddFeature[] {
  try {
    return (JSON.parse(raw) as { features: BddFeature[] }).features ?? [];
  } catch {
    return [];
  }
}

const route = useRoute();
const router = useRouter();
// @ts-ignore
const id = Array.isArray(route.params.id)
  ? // @ts-ignore
    route.params.id[0]
  : // @ts-ignore
    route.params.id;
// @ts-ignore
const epicId = Array.isArray(route.params.epicId)
  ? // @ts-ignore
    route.params.epicId[0]
  : // @ts-ignore
    route.params.epicId;

const service = new StarterProjectService();

const activeTab = ref("features");

const project = useLiveQuery(
  () => starterProjectDB.starterProjects.get(id),
  null,
);

const epic = useLiveQuery(
  () => starterProjectDB.starterProjectEpics.get(epicId),
  null,
);

const epicStatus = useLiveQuery(
  () =>
    starterProjectDB.starterProjectEpicStatuses
      .where("epicId")
      .equals(epicId)
      .first(),
  null,
);

const userStories = useLiveQuery(
  () =>
    starterProjectDB.starterProjectUserStories
      .where("epicId")
      .equals(epicId)
      .toArray(),
  [],
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
  };
  return labels[status ?? "PENDING"] ?? status ?? "Pendente";
}

function reprocessBDD() {
  service.reprocessEpicBDD(id, epicId);
}

function reprocessUserStories() {
  service.reprocessEpicUserStories(id, epicId);
}

function reprocessAll() {
  service.reprocessEpicAll(id, epicId);
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
          <BreadcrumbLink
            class="cursor-pointer"
            @click="router.push(`/project/${id}/epics`)"
          >
            Épicos
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{{ epic?.name ?? "..." }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <template v-if="epic">
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <Badge class="text-xs uppercase">Épico</Badge>
          </div>
          <h1 class="text-2xl font-bold">{{ epic.name }}</h1>
          <p class="text-muted-foreground text-sm">{{ epic.description }}</p>
        </div>
        <div class="flex gap-2">
          <Button
            v-if="
              epicStatus?.bdd === 'FAILURE' ||
              epicStatus?.userStories === 'FAILURE'
            "
            size="sm"
            variant="outline"
            @click="reprocessAll"
          >
            <Icon icon="lucide:refresh-cw" />
            Tentar novamente
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="router.push(`/project/${id}/epics`)"
          >
            <Icon icon="lucide:arrow-left" />
            Voltar
          </Button>
        </div>
      </div>

      <Separator />

      <Tabs v-model="activeTab">
        <TabsList>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="userStories">Histórias de Usuário</TabsTrigger>
          <TabsTrigger value="bdd">BDD</TabsTrigger>
        </TabsList>

        <!-- Features Tab -->
        <TabsContent value="features">
          <div class="mt-4 flex flex-col gap-3">
            <h2 class="text-lg font-semibold">Features</h2>
            <p
              v-if="!epic.features?.length"
              class="text-muted-foreground text-sm"
            >
              Nenhuma feature listada.
            </p>
            <div
              v-else
              class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3"
            >
              <Card v-for="(feature, i) in epic.features" :key="i">
                <CardContent class="pt-4">
                  <p class="text-sm">{{ feature }}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <!-- User Stories Tab -->
        <TabsContent value="userStories">
          <div class="mt-4 flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-semibold">Histórias de Usuário</h2>
                <Badge :variant="getStatusVariant(epicStatus?.userStories)">
                  {{ getStatusLabel(epicStatus?.userStories) }}
                </Badge>
              </div>
              <Button
                v-if="epicStatus?.userStories === 'FAILURE'"
                size="sm"
                variant="outline"
                @click="reprocessUserStories"
              >
                <Icon icon="lucide:refresh-cw" />
                Tentar novamente
              </Button>
            </div>

            <p
              v-if="epicStatus?.userStories === 'DOING'"
              class="text-muted-foreground flex items-center gap-2 text-sm"
            >
              <Icon icon="lucide:loader" class="h-4 w-4 animate-spin" />
              Gerando Histórias de Usuário...
            </p>

            <div
              v-else-if="userStories.length"
              class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
            >
              <Card v-for="us in userStories" :key="us.id">
                <CardHeader>
                  <CardTitle class="text-base">{{ us.title }}</CardTitle>
                </CardHeader>
                <CardContent class="flex flex-col gap-3">
                  <p class="text-muted-foreground text-sm">
                    {{ us.description }}
                  </p>

                  <template v-if="us.acceptanceCriteria">
                    <div>
                      <p
                        class="mb-1 text-xs font-semibold uppercase tracking-wide"
                      >
                        Critérios de Aceitação
                      </p>
                      <p
                        class="text-muted-foreground whitespace-pre-wrap text-sm"
                      >
                        {{ us.acceptanceCriteria }}
                      </p>
                    </div>
                  </template>

                  <template v-if="us.subtasks?.length">
                    <div>
                      <p
                        class="mb-1 text-xs font-semibold uppercase tracking-wide"
                      >
                        Subtarefas
                      </p>
                      <ul class="flex flex-col gap-1">
                        <li
                          v-for="(subtask, i) in us.subtasks"
                          :key="i"
                          class="flex items-start gap-2 text-sm"
                        >
                          <Icon
                            icon="lucide:circle-dot"
                            class="text-muted-foreground mt-0.5 h-3 w-3 shrink-0"
                          />
                          {{ subtask }}
                        </li>
                      </ul>
                    </div>
                  </template>
                </CardContent>
              </Card>
            </div>
            <p
              v-else-if="epicStatus?.userStories !== 'PENDING'"
              class="text-muted-foreground text-sm"
            >
              Nenhuma história de usuário gerada ainda.
            </p>
          </div>
        </TabsContent>

        <!-- BDD Tab -->
        <TabsContent value="bdd">
          <div class="mt-4 flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-semibold">BDD</h2>
                <Badge :variant="getStatusVariant(epicStatus?.bdd)">
                  {{ getStatusLabel(epicStatus?.bdd) }}
                </Badge>
              </div>
              <Button
                v-if="epicStatus?.bdd === 'FAILURE'"
                size="sm"
                variant="outline"
                @click="reprocessBDD"
              >
                <Icon icon="lucide:refresh-cw" />
                Tentar novamente
              </Button>
            </div>

            <p
              v-if="epicStatus?.bdd === 'DOING'"
              class="text-muted-foreground flex items-center gap-2 text-sm"
            >
              <Icon icon="lucide:loader" class="h-4 w-4 animate-spin" />
              Gerando BDD...
            </p>

            <template v-else-if="epic.bdd">
              <template
                v-for="feature in parseBdd(epic.bdd)"
                :key="feature.name"
              >
                <Card class="mb-4">
                  <CardHeader class="pb-2">
                    <CardTitle class="text-base">{{ feature.name }}</CardTitle>
                  </CardHeader>
                  <CardContent class="space-y-4">
                    <div
                      v-for="scenario in feature.scenarios"
                      :key="scenario.title"
                      class="border-l-2 border-muted pl-4 space-y-1 text-sm"
                    >
                      <p class="font-medium">{{ scenario.title }}</p>
                      <p
                        v-for="g in scenario.given"
                        :key="g"
                        class="text-muted-foreground"
                      >
                        <span class="font-semibold text-foreground">Dado </span
                        >{{ g }}
                      </p>
                      <p
                        v-for="w in scenario.when"
                        :key="w"
                        class="text-muted-foreground"
                      >
                        <span class="font-semibold text-foreground"
                          >Quando </span
                        >{{ w }}
                      </p>
                      <p
                        v-for="t in scenario.then"
                        :key="t"
                        class="text-muted-foreground"
                      >
                        <span class="font-semibold text-foreground">Então </span
                        >{{ t }}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </template>
            </template>

            <p v-else class="text-muted-foreground text-sm">
              Sem BDD gerado ainda.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </template>

    <p v-else class="text-muted-foreground">Carregando...</p>
  </div>
</template>
