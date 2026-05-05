<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { flags } from "@/lib/featureFlags";
import { Icon } from "@iconify/vue";
import { useRouter } from "vue-router";
import { useLiveQuery } from "../core/composables/useLiveQuery";
import type { StarterProjectRecord } from "../core/database/StarterProjectDB";
import { starterProjectDB } from "../core/database/StarterProjectDB";
import { StarterProjectService } from "../core/services/starter_project";

const LOCAL_USER_ID = "local";
const router = useRouter();
const service = new StarterProjectService();

const projects = useLiveQuery(
  () =>
    starterProjectDB.starterProjects
      .where("userId")
      .equals(LOCAL_USER_ID)
      .toArray(),
  [] as StarterProjectRecord[],
);

function projectRank(title: string): string {
  return title.trim().charAt(0).toUpperCase() || "?";
}

async function handleDelete(project: StarterProjectRecord): Promise<void> {
  if (
    !window.confirm(
      `Apagar projeto "${project.title}"? Essa ação não pode ser desfeita.`,
    )
  ) {
    return;
  }
  await service.deleteProject(project.id);
}
</script>

<template>
  <div class="flex flex-1 flex-col gap-6 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold tracking-tight">Meus Projetos</h1>
        <p
          v-if="projects.length > 0"
          class="text-sm text-muted-foreground mt-0.5"
        >
          {{ projects.length }} projeto{{ projects.length !== 1 ? "s" : "" }}
        </p>
      </div>
      <Button size="sm" @click="router.push('/project/create')">
        <Icon icon="lucide:sparkles" class="mr-1.5 h-3.5 w-3.5" />
        Nova Ideia
      </Button>
    </div>

    <!-- Project grid — card-style -->
    <div
      v-if="projects.length > 0"
      class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
    >
      <ContextMenu
        v-for="project in projects"
        :key="project.id"
      >
        <ContextMenuTrigger as-child>
          <div
            class="group relative flex aspect-[5/7] cursor-pointer flex-col overflow-hidden rounded-xl border border-border/60 bg-card ring-1 ring-border/30 shadow-md transition-all duration-200 hover:shadow-xl hover:scale-[1.02] hover:ring-border/60 active:scale-[0.99]"
            @click="router.push(`/project/${project.id}`)"
          >
            <!-- Top-left rank + icon -->
            <div class="flex items-center justify-between px-3 pt-3">
              <span
                class="font-bold text-lg leading-none text-foreground/80 select-none"
              >
                {{ projectRank(project.title) }}
              </span>
              <Icon
                icon="lucide:layers"
                class="h-3.5 w-3.5 text-muted-foreground/50"
              />
            </div>

            <!-- Center: icon + title -->
            <div
              class="flex flex-1 flex-col items-center justify-center gap-2 px-3 text-center"
            >
              <div
                class="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 ring-1 ring-border/30 transition-colors group-hover:bg-primary/10 group-hover:ring-primary/30"
              >
                <Icon
                  icon="lucide:layers"
                  class="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors"
                />
              </div>
              <p
                class="text-sm font-semibold leading-snug tracking-tight text-foreground line-clamp-3"
              >
                {{ project.title }}
              </p>
            </div>

            <!-- Base: date + prompt -->
            <div class="flex flex-col gap-1 px-3 pb-3">
              <p
                v-if="project.createdAt"
                class="text-[10px] font-medium text-muted-foreground/70"
              >
                {{
                  new Date(project.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })
                }}
              </p>
              <p
                class="text-[10px] text-muted-foreground/60 line-clamp-2 leading-relaxed"
              >
                {{ project.prompt }}
              </p>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            variant="destructive"
            @select="handleDelete(project)"
          >
            <Icon icon="lucide:trash-2" />
            Apagar
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-16 text-center"
    >
      <div
        class="flex h-12 w-12 items-center justify-center rounded-full bg-muted"
      >
        <Icon icon="lucide:layers" class="h-5 w-5 text-muted-foreground" />
      </div>
      <div class="space-y-1">
        <p class="font-medium text-sm">Nenhum projeto ainda</p>
        <p class="text-muted-foreground text-sm max-w-xs">
          {{
            flags.theDeck
              ? "Crie sua primeira ideia e o D.E.C.K. vai transformá-la em um plano completo."
              : "Crie sua primeira ideia para começar."
          }}
        </p>
      </div>
      <Button size="sm" @click="router.push('/project/create')">
        <Icon icon="lucide:sparkles" class="mr-1.5 h-3.5 w-3.5" />
        Criar Projeto
      </Button>
    </div>
  </div>
</template>
