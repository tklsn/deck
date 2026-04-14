<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { flags } from "@/lib/featureFlags";
import { Icon } from "@iconify/vue";
import { useRouter } from "vue-router";
import { useLiveQuery } from "../core/composables/useLiveQuery";
import type { StarterProjectRecord } from "../core/database/StarterProjectDB";
import { starterProjectDB } from "../core/database/StarterProjectDB";
import {
  hasProjectFrameCustomization,
  resolveProjectFrame,
} from "../core/services/project_frame";

const LOCAL_USER_ID = "local";
const router = useRouter();

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

function projectFrame(project: StarterProjectRecord) {
  return resolveProjectFrame(project);
}

function projectCardStyle(project: StarterProjectRecord) {
  if (!hasProjectFrameCustomization(project)) return undefined;
  return {
    // 66 (hex alpha) = approximately 40% opacity.
    borderColor: `${projectFrame(project).color}66`,
  };
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
      <div
        v-for="project in projects"
        :key="project.id"
        class="group relative flex aspect-[5/7] cursor-pointer flex-col overflow-hidden rounded-xl border border-border/60 bg-card ring-1 ring-border/30 shadow-md transition-all duration-200 hover:shadow-xl hover:scale-[1.02] hover:ring-border/60 active:scale-[0.99]"
        :style="projectCardStyle(project)"
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
            :icon="projectFrame(project).icon"
            class="h-3.5 w-3.5 text-muted-foreground/50"
            :style="hasProjectFrameCustomization(project) ? { color: projectFrame(project).color } : undefined"
          />
        </div>

        <!-- Center: icon + title -->
        <div
          class="flex flex-1 flex-col items-center justify-center gap-2 px-3 text-center"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 ring-1 ring-border/30 transition-colors group-hover:bg-primary/10 group-hover:ring-primary/30"
            :style="hasProjectFrameCustomization(project) ? { backgroundColor: `${projectFrame(project).color}1a` } : undefined"
          >
            <Icon
              :icon="projectFrame(project).icon"
              class="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors"
              :style="hasProjectFrameCustomization(project) ? { color: projectFrame(project).color } : undefined"
            />
          </div>
          <p
            class="text-sm font-semibold leading-snug tracking-tight text-foreground line-clamp-3"
          >
            {{ projectFrame(project).title }}
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

        <!-- Bottom-right rank + icon (rotated 180°)
        <div class="flex items-center justify-between px-3 pb-3 rotate-180">
          <span class="font-bold text-lg leading-none text-foreground/80 select-none">
            {{ projectRank(project.title) }}
          </span>
          <Icon icon="lucide:layers" class="h-3.5 w-3.5 text-muted-foreground/50" />
        </div> -->
      </div>
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
