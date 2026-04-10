<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getApiKey,
  removeApiKey,
  setApiKey,
} from "@/core/services/provider_settings";
import { Icon } from "@iconify/vue";
import { onMounted, ref } from "vue";

interface ProviderEntry {
  id: string;
  label: string;
  description: string;
  placeholder: string;
  keyPrefix: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  icon: string;
  models: string[];
  configured: boolean;
  inputValue: string;
  showKey: boolean;
  saved: boolean;
}

const providers = ref<ProviderEntry[]>([
  {
    id: "openai",
    label: "OpenAI",
    description: "Conecte sua conta OpenAI para usar GPT-4o e demais modelos.",
    placeholder: "sk-proj-...",
    keyPrefix: "sk-",
    accent: "text-emerald-500",
    accentBg: "bg-emerald-500/8 dark:bg-emerald-500/10",
    accentBorder: "border-emerald-500/25",
    icon: "simple-icons:openai",
    models: ["GPT-4o", "GPT-4o mini", "o1", "o3-mini"],
    configured: false,
    inputValue: "",
    showKey: false,
    saved: false,
  },
  {
    id: "anthropic",
    label: "Anthropic",
    description: "Acesse Claude Sonnet, Haiku e demais modelos Anthropic.",
    placeholder: "sk-ant-api03-...",
    keyPrefix: "sk-ant-",
    accent: "text-orange-500",
    accentBg: "bg-orange-500/8 dark:bg-orange-500/10",
    accentBorder: "border-orange-500/25",
    icon: "simple-icons:anthropic",
    models: ["Claude Sonnet 4.5", "Claude Haiku 4.5", "Claude Opus 4"],
    configured: false,
    inputValue: "",
    showKey: false,
    saved: false,
  },
]);

const configuredCount = () => providers.value.filter((p) => p.configured).length;

onMounted(() => {
  for (const p of providers.value) {
    p.configured = getApiKey(p.id) !== null;
  }
});

async function save(p: ProviderEntry) {
  const key = p.inputValue.trim();
  if (!key) return;
  await setApiKey(p.id, key);
  p.configured = true;
  p.inputValue = "";
  p.showKey = false;
  p.saved = true;
  setTimeout(() => (p.saved = false), 2000);
}

async function remove(p: ProviderEntry) {
  await removeApiKey(p.id);
  p.configured = false;
  p.inputValue = "";
  p.showKey = false;
}

function maskedPreview(id: string): string {
  const key = getApiKey(id);
  if (!key) return "";
  const visible = key.slice(0, 8);
  return visible + "••••••••••••••••";
}
</script>

<template>
  <main class="min-h-full p-6 lg:p-8 w-full">
    <div class="max-w-2xl mx-auto flex flex-col gap-8">

      <!-- Header -->
      <div class="flex items-start justify-between">
        <div>
          <div class="flex items-center gap-2.5 mb-1">
            <div class="p-1.5 rounded-lg bg-muted">
              <Icon icon="lucide:key-round" class="h-4 w-4 text-muted-foreground" />
            </div>
            <h1 class="text-lg font-semibold tracking-tight">Chaves de API</h1>
          </div>
          <p class="text-sm text-muted-foreground ml-0.5">
            Configure suas credenciais para provedores externos de IA.
          </p>
        </div>
        <div class="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-md">
          <span class="h-1.5 w-1.5 rounded-full"
            :class="configuredCount() > 0 ? 'bg-emerald-500' : 'bg-muted-foreground/40'"
          />
          {{ configuredCount() }}/{{ providers.length }} configurados
        </div>
      </div>

      <!-- Provider cards -->
      <div class="flex flex-col gap-3">
        <div
          v-for="p in providers"
          :key="p.id"
          class="rounded-xl border bg-card transition-all duration-200"
          :class="p.configured ? [p.accentBorder] : 'border-border'"
        >
          <!-- Card header -->
          <div
            class="flex items-center justify-between px-5 py-4 rounded-t-xl"
            :class="p.configured ? p.accentBg : ''"
          >
            <div class="flex items-center gap-3">
              <!-- Status dot + icon -->
              <div class="relative">
                <div class="p-2 rounded-lg bg-background border border-border/60 shadow-xs">
                  <Icon :icon="p.icon" class="h-4 w-4" :class="p.configured ? p.accent : 'text-muted-foreground'" />
                </div>
                <span
                  class="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-card transition-colors duration-300"
                  :class="p.configured ? 'bg-emerald-500' : 'bg-muted-foreground/30'"
                />
              </div>

              <div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">{{ p.label }}</span>
                  <span
                    v-if="p.configured"
                    class="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    :class="[p.accentBg, p.accent, p.accentBorder, 'border']"
                  >
                    <Icon icon="lucide:check" class="h-2.5 w-2.5" />
                    Ativa
                  </span>
                </div>
                <p class="text-xs text-muted-foreground mt-0.5">{{ p.description }}</p>
              </div>
            </div>

            <!-- Remove button -->
            <button
              v-if="p.configured"
              @click="remove(p)"
              class="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150 cursor-pointer"
              title="Remover chave"
            >
              <Icon icon="lucide:trash-2" class="h-3.5 w-3.5" />
            </button>
          </div>

          <!-- Divider -->
          <div class="h-px bg-border mx-0" />

          <!-- Card body -->
          <div class="px-5 py-4 space-y-4">

            <!-- Current key preview (when configured) -->
            <div v-if="p.configured" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
              <Icon icon="lucide:lock-keyhole" class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span class="font-mono text-xs text-muted-foreground tracking-widest flex-1 truncate">
                {{ maskedPreview(p.id) }}
              </span>
              <span class="text-[10px] text-muted-foreground/60 shrink-0">armazenada</span>
            </div>

            <!-- Input row -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-muted-foreground">
                {{ p.configured ? 'Atualizar chave' : 'Inserir chave de API' }}
              </label>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <Input
                    v-model="p.inputValue"
                    :type="p.showKey ? 'text' : 'password'"
                    :placeholder="p.placeholder"
                    class="font-mono text-xs pr-9"
                    @keydown.enter="save(p)"
                  />
                  <button
                    type="button"
                    @click="p.showKey = !p.showKey"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Icon :icon="p.showKey ? 'lucide:eye-off' : 'lucide:eye'" class="h-3.5 w-3.5" />
                  </button>
                </div>
                <Button
                  @click="save(p)"
                  :disabled="!p.inputValue.trim()"
                  size="sm"
                  class="shrink-0 min-w-16 transition-all duration-200"
                  :class="p.saved ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''"
                >
                  <Icon v-if="p.saved" icon="lucide:check" class="h-3.5 w-3.5 mr-1.5" />
                  {{ p.saved ? 'Salvo!' : 'Salvar' }}
                </Button>
              </div>
            </div>

            <!-- Available models chips -->
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="model in p.models"
                :key="model"
                class="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50"
              >
                {{ model }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer note -->
      <p class="text-xs text-muted-foreground/60 text-center">
        As chaves são armazenadas localmente no seu dispositivo, não são enviadas para nossos servidores e só são usadas diretamente pelos provedores selecionados ao fazer requisições.
      </p>
    </div>
  </main>
</template>
