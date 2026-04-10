<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLLMModelsAdapter } from "@/core/adapters/LLMsManagement/ExternalLLMModelsAdapter";
import { LocalLLMModelsAdapter } from "@/core/adapters/LLMsManagement/LocalLLMModelsAdapter";
import { getApiKey } from "@/core/services/provider_settings";
import { StarterProjectService } from "@/core/services/starter_project";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { z } from "zod";
import type { ExternalLLMProvider } from "../../core/services/external_llm";
import type { LocalLLMModel } from "../../core/ports/UtilsAndLLMs/LocalLLMModelsPort";

const router = useRouter();

const schema = z.object({
  title: z.string().min(3).max(100),
  prompt: z.string().min(3),
  lang: z.enum(["pt-BR", "en"]),
  provider: z.enum(["ollama", "lmstudio", "openai", "anthropic"]),
  model: z.string().optional(),
});

const validationSchema = toTypedSchema(schema);

const { defineField, handleSubmit, errors, setFieldValue } = useForm({
  validationSchema,
  initialValues: {
    title: "",
    prompt: "",
    lang: "pt-BR",
    provider: "ollama",
    model: "",
  },
});

const [title, titleAttrs] = defineField("title");
const [prompt, promptAttrs] = defineField("prompt");
const [lang, langAttrs] = defineField("lang");
const [provider, providerAttrs] = defineField("provider");
const [model, modelAttrs] = defineField("model");

type ProviderValue = "ollama" | "lmstudio" | "openai" | "anthropic";

const providers = ref([
  {
    value: "ollama" as ProviderValue,
    label: "Ollama",
    enabled: false,
    icon: "https://ollama.com/public/icon-16x16.png",
  },
  {
    value: "lmstudio" as ProviderValue,
    label: "LM Studio",
    enabled: false,
    icon: "https://lmstudio.ai/favicon.ico",
  },
  {
    value: "openai" as ProviderValue,
    label: "OpenAI",
    enabled: false,
    icon: "https://openai.com/favicon.ico",
  },
  {
    value: "anthropic" as ProviderValue,
    label: "Anthropic",
    enabled: false,
    icon: "https://www.anthropic.com/favicon.ico",
  },
]);

const availableModels = ref<LocalLLMModel[]>([]);
const loadingModels = ref(false);
const detecting = ref(true);

const selectedProvider = () =>
  providers.value.find((p) => p.value === provider.value);

async function tryListModels(
  p: "ollama" | "lmstudio",
): Promise<LocalLLMModel[] | null> {
  try {
    return await new LocalLLMModelsAdapter({ provider: p }).listModels();
  } catch {
    return null;
  }
}

async function loadModels(p: string) {
  loadingModels.value = true;
  availableModels.value = [];
  setFieldValue("model", "");
  try {
    let models: LocalLLMModel[];
    if (p === "openai" || p === "anthropic") {
      const apiKey = getApiKey(p) ?? "";
      models = await new ExternalLLMModelsAdapter(p as ExternalLLMProvider, apiKey).listModels();
    } else {
      models = await new LocalLLMModelsAdapter({ provider: p as "ollama" | "lmstudio" }).listModels();
    }
    availableModels.value = models;
    if (models.length > 0) setFieldValue("model", models[0]?.id);
  } catch {
    availableModels.value = [];
  } finally {
    loadingModels.value = false;
  }
}

watch(provider, (newProvider) => {
  if (detecting.value || !newProvider) return;
  loadModels(newProvider);
});

onMounted(async () => {
  detecting.value = true;

  const [ollamaModels, lmstudioModels] = await Promise.all([
    tryListModels("ollama"),
    tryListModels("lmstudio"),
  ]);

  const ollamaEntry = providers.value.find((p) => p.value === "ollama")!;
  const lmstudioEntry = providers.value.find((p) => p.value === "lmstudio")!;

  ollamaEntry.enabled = ollamaModels !== null;
  lmstudioEntry.enabled = lmstudioModels !== null;

  // Enable external providers based on stored API keys
  for (const ext of ["openai", "anthropic"] as const) {
    const entry = providers.value.find((p) => p.value === ext)!;
    entry.enabled = getApiKey(ext) !== null;
  }

  if (ollamaModels !== null) {
    setFieldValue("provider", "ollama");
    availableModels.value = ollamaModels;
    if (ollamaModels.length > 0) setFieldValue("model", ollamaModels[0]?.id);
  } else if (lmstudioModels !== null) {
    setFieldValue("provider", "lmstudio");
    availableModels.value = lmstudioModels;
    if (lmstudioModels.length > 0)
      setFieldValue("model", lmstudioModels[0]?.id);
  }

  detecting.value = false;
});

const onSubmit = handleSubmit(async (_values) => {
  const __service = new StarterProjectService();

  const values: typeof _values & { userId: string } = {
    ..._values,
    userId: "local",
  };

  const isLocal = ["ollama", "lmstudio"].includes(_values.provider);

  const project = await __service.createProject(
    values,
    isLocal,
    true,
  );

  if (project) {
    router.push(`/project/${project.id}`);
  } else {
    alert("Erro ao criar projeto");
  }
});
</script>

<template>
  <main class="p-5 w-full flex justify-center items-center">
    <Card class="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Criar Projeto</CardTitle>
        <CardDescription>
          Insira os dados abaixo para gerar um ponto de partida para o
          desenvolvimento do seu projeto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="onSubmit">
          <Field>
            <FieldLabel>Título</FieldLabel>
            <Input
              v-model="title"
              v-bind="titleAttrs"
              placeholder="Minha ideia incrível"
            />
            <FieldError v-if="errors.title" :errors="[errors.title]" />
          </Field>

          <Field>
            <FieldLabel>Prompt</FieldLabel>
            <Textarea
              v-model="prompt"
              v-bind="promptAttrs"
              placeholder="Descreva sua ideia com detalhes..."
            />
            <FieldError v-if="errors.prompt" :errors="[errors.prompt]" />
          </Field>

          <Field>
            <FieldLabel>Idioma</FieldLabel>
            <Select
              v-model="lang"
              v-bind="langAttrs"
              :aria-invalid="!!errors.lang"
            >
              <SelectTrigger
                id="form-lang"
                :aria-invalid="!!errors.lang"
                class="min-w-30"
              >
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                <SelectItem
                  v-for="language in ['pt-BR', 'en']"
                  :key="language"
                  :value="language"
                >
                  {{ language }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FieldError v-if="errors.lang" :errors="[errors.lang]" />
          </Field>

          <Field>
            <FieldLabel>Provedor de IA</FieldLabel>
            <Select
              v-model="provider"
              v-bind="providerAttrs"
              :aria-invalid="!!errors.provider"
              :disabled="detecting"
            >
              <SelectTrigger
                id="form-provider"
                :aria-invalid="!!errors.provider"
              >
                <SelectValue placeholder="Selecionar">
                  <div v-if="provider" class="flex items-center gap-2">
                    <img
                      :src="selectedProvider()?.icon"
                      alt=""
                      class="h-4 w-4 rounded-sm"
                    />
                    <span>{{ selectedProvider()?.label }}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent position="item-aligned">
                <SelectItem
                  v-for="option in providers"
                  :key="option.value"
                  :value="option.value"
                  :disabled="!option.enabled"
                >
                  <div class="flex items-center gap-2">
                    <img
                      v-if="option.icon"
                      :src="option.icon"
                      alt=""
                      class="h-4 w-4 rounded-sm"
                    />
                    <span>{{ option.label }}</span>
                    <span
                      v-if="!option.enabled"
                      class="text-muted-foreground text-xs"
                      >indisponível</span
                    >
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="detecting" class="text-muted-foreground text-xs mt-1">
              Detectando provedores disponíveis...
            </p>
            <FieldError v-if="errors.provider" :errors="[errors.provider]" />
          </Field>

          <Field>
            <FieldLabel>Modelo</FieldLabel>
            <Select
              v-model="model"
              v-bind="modelAttrs"
              :aria-invalid="!!errors.model"
              :disabled="loadingModels || availableModels.length === 0"
            >
              <SelectTrigger
                id="form-model"
                :aria-invalid="!!errors.model"
                class="min-w-45"
              >
                <SelectValue placeholder="Selecionar modelo" />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                <SelectItem
                  v-for="m in availableModels"
                  :key="m.id"
                  :value="m.id"
                >
                  {{ m.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="loadingModels" class="text-muted-foreground text-xs mt-1">
              Carregando modelos...
            </p>
            <p
              v-else-if="provider && availableModels.length === 0"
              class="text-muted-foreground text-xs mt-1"
            >
              Nenhum modelo instalado encontrado.
            </p>
            <FieldError v-if="errors.model" :errors="[errors.model]" />
          </Field>

          <div class="flex gap-2 mt-4">
            <Button type="button" variant="outline" @click="router.push('/')"
              >Cancelar</Button
            >
            <Button type="submit" :disabled="detecting">Criar Projeto</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </main>
</template>
