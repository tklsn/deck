<script setup lang="ts">
import { computed } from "vue";
import MarkdownRenderer from "./MarkdownRenderer.vue";
import { Badge } from "@/components/ui/badge";

const props = defineProps<{ content: string }>();

const FIELD_LABELS: Record<string, string> = {
  overview: "Visão Geral",
  features: "Funcionalidades",
  flows: "Fluxos do Sistema",
  suggestions: "Sugestões",
  section_title: "",
  content: "Descrição",
  items: "Itens",
  functional_requirements: "Requisitos Funcionais",
  non_functional_requirements: "Requisitos Não Funcionais",
  tasks: "Tarefas",
  deliverables: "Entregas",
  milestones: "Marcos",
  in_scope: "Dentro do Escopo",
  out_of_scope: "Fora do Escopo",
  assumptions: "Premissas",
  components: "Componentes",
  decisions: "Decisões de Arquitetura",
  points: "Pontos Essenciais",
  questions: "Questões",
  key_concepts: "Conceitos-Chave",
  epics: "Épicos",
  screens: "Telas",
  acceptance_criteria: "Critérios de Aceite",
  stories: "User Stories",
  scenarios: "Cenários",
};

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  alta: "destructive",
  média: "secondary",
  baixa: "default",
};

type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;
type JsonObject = Record<string, JsonValue>;

const parsed = computed<JsonObject | null>(() => {
  try {
    const obj = JSON.parse(props.content);
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) ? obj : null;
  } catch {
    return null;
  }
});

const sectionTitle = computed<string | null>(() => {
  const obj = parsed.value;
  return obj && typeof obj["section_title"] === "string" ? obj["section_title"] : null;
});

const fields = computed(() => {
  const obj = parsed.value;
  if (!obj) return [];
  return Object.entries(obj).filter(([key]) => key !== "section_title");
});

function isStringArray(val: JsonValue): val is string[] {
  return Array.isArray(val) && val.every((v) => typeof v === "string");
}

function isObjectArray(val: JsonValue): val is JsonObject[] {
  return Array.isArray(val) && val.every((v) => typeof v === "object" && v !== null && !Array.isArray(v));
}

function label(key: string): string {
  return FIELD_LABELS[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
</script>

<template>
  <!-- Fallback to raw text if not valid JSON -->
  <MarkdownRenderer v-if="!parsed" :content="content" />

  <div v-else class="space-y-8">
    <h2 v-if="sectionTitle" class="text-2xl font-semibold">{{ sectionTitle }}</h2>

    <template v-for="[key, value] in fields" :key="key">
      <!-- Skip empty values -->
      <template v-if="value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)">
        <section class="space-y-3">
          <h3 v-if="label(key)" class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {{ label(key) }}
          </h3>

          <!-- Plain string (possibly with markdown) -->
          <MarkdownRenderer v-if="typeof value === 'string'" :content="value" />

          <!-- Array of strings → bullet list -->
          <ul v-else-if="isStringArray(value)" class="space-y-2 pl-1">
            <li v-for="(item, i) in value" :key="i" class="flex gap-3">
              <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40 mt-[9px]" />
              <span>{{ item }}</span>
            </li>
          </ul>

          <!-- Array of objects -->
          <div v-else-if="isObjectArray(value)" class="space-y-3">
            <div
              v-for="(item, i) in value"
              :key="i"
              class="rounded-md border bg-card p-4 space-y-2"
            >
              <!-- id + badges row -->
              <div v-if="item['id'] || item['priority'] || item['category']" class="flex items-center gap-2 flex-wrap">
                <span v-if="item['id']" class="font-mono text-xs font-semibold text-muted-foreground">{{ item["id"] }}</span>
                <Badge
                  v-if="item['priority']"
                  :variant="PRIORITY_VARIANT[item['priority'] as string] ?? 'default'"
                  class="text-xs"
                >
                  {{ item["priority"] }}
                </Badge>
                <Badge v-if="item['category']" variant="secondary" class="text-xs">
                  {{ item["category"] }}
                </Badge>
                <Badge v-if="item['technology']" variant="outline" class="text-xs">
                  {{ item["technology"] }}
                </Badge>
              </div>

              <!-- title / name -->
              <p v-if="item['title'] ?? item['name']" class="font-medium text-base leading-snug">
                {{ item["title"] ?? item["name"] }}
              </p>

              <!-- description / explanation / body -->
              <p v-if="item['description'] ?? item['explanation'] ?? item['body']" class="text-muted-foreground leading-relaxed">
                {{ item["description"] ?? item["explanation"] ?? item["body"] }}
              </p>

              <!-- nested string arrays (acceptance_criteria, given, when, then…) -->
              <template v-for="[subKey, subVal] in Object.entries(item)" :key="subKey">
                <template v-if="isStringArray(subVal) && subVal.length > 0">
                  <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-3">
                    {{ label(subKey) }}
                  </p>
                  <ul class="space-y-1.5 pl-1">
                    <li v-for="(s, j) in subVal" :key="j" class="flex gap-3">
                      <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40 mt-[9px]" />
                      <span>{{ s }}</span>
                    </li>
                  </ul>
                </template>
              </template>
            </div>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>
