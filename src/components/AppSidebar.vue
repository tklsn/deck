<script setup lang="ts">
import logoSvg from "@/assets/logo.svg";
import { flags } from "@/lib/featureFlags";
import { Icon } from "@iconify/vue";
import { useColorMode } from "@vueuse/core";
import { useRoute } from "vue-router";
import { version as appVersion } from "../../package.json";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  type SidebarProps,
} from "./ui/sidebar";
import SidebarFooter from "./ui/sidebar/SidebarFooter.vue";

const props = defineProps<SidebarProps>();
const mode = useColorMode();
const route = useRoute();
</script>

<template>
  <Sidebar v-bind="props">
    <!-- ── Header ─────────────────────────────────────────────────────── -->
    <SidebarHeader class="border-b border-sidebar-border">
      <!-- D.E.C.K. branding -->
      <div
        v-if="flags.theDeck"
        class="flex items-center justify-between px-1 py-1.5"
      >
        <div class="flex items-center gap-2.5">
          <img
            :src="logoSvg"
            class="h-12 w-12 shrink-0 select-none"
            alt="D.E.C.K."
          />
          <div class="flex flex-col leading-none">
            <span class="text-sm font-semibold tracking-tight">D.E.C.K.</span>
            <span class="text-[10px] font-medium text-muted-foreground">
              powered by SofIA - ALPHA
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0">
              <Icon
                icon="radix-icons:moon"
                class="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
              />
              <Icon
                icon="radix-icons:sun"
                class="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
              />
              <span class="sr-only">Tema</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="mode = 'light'">Claro</DropdownMenuItem>
            <DropdownMenuItem @click="mode = 'dark'">Escuro</DropdownMenuItem>
            <DropdownMenuItem @click="mode = 'auto'">Sistema</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <!-- SofIA branding -->
      <div v-else class="flex items-center justify-between py-1">
        <h1 class="text-sm font-semibold">
          SofIA
          <span class="font-normal text-muted-foreground text-xs"
            >Desktop · Alpha</span
          >
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="icon" class="h-7 w-7">
              <Icon
                icon="radix-icons:moon"
                class="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
              />
              <Icon
                icon="radix-icons:sun"
                class="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
              />
              <span class="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="mode = 'light'">Light</DropdownMenuItem>
            <DropdownMenuItem @click="mode = 'dark'">Dark</DropdownMenuItem>
            <DropdownMenuItem @click="mode = 'auto'">System</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </SidebarHeader>

    <!-- ── Nav ───────────────────────────────────────────────────────── -->
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Desenvolvimento</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <RouterLink to="/">
              <SidebarMenuButton :is-active="route.path === '/'">
                <Icon icon="lucide:layout-grid" />
                Meus Projetos
              </SidebarMenuButton>
            </RouterLink>
            <RouterLink to="/project/create">
              <SidebarMenuButton :is-active="route.path === '/project/create'">
                <Icon icon="lucide:sparkles" />
                Nova Ideia
              </SidebarMenuButton>
            </RouterLink>
            <RouterLink to="/settings">
              <SidebarMenuButton :is-active="route.path === '/settings'">
                <Icon icon="lucide:settings" />
                Configurações
              </SidebarMenuButton>
            </RouterLink>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <!-- ── Footer ────────────────────────────────────────────────────── -->
    <SidebarFooter>
      <div v-if="flags.theDeck" class="px-3 py-2">
        <p class="text-[10px] text-muted-foreground/60">
          D.E.C.K. · v{{ appVersion }}
        </p>
      </div>
    </SidebarFooter>
  </Sidebar>
</template>
