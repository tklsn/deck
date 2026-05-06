<script setup lang="ts">
import ProviderModelSelect from "@/components/ProviderModelSelect.vue";
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
import { StarterProjectService } from "@/core/services/starter_project";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { z } from "zod";

const router = useRouter();

const schema = z.object({
  title: z.string().min(3).max(100),
  prompt: z.string().min(3),
  lang: z.enum(["pt-BR", "en"]),
  provider: z.enum(["ollama", "lmstudio", "openai", "anthropic", "openrouter"]),
  model: z.string().optional(),
});

const validationSchema = toTypedSchema(schema);

const { defineField, handleSubmit, errors } = useForm({
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
const [provider] = defineField("provider");
const [model] = defineField("model");

const detecting = ref(true);

const onSubmit = handleSubmit(async (_values) => {
  const service = new StarterProjectService();

  const values: typeof _values & { userId: string } = {
    ..._values,
    userId: "local",
  };

  const project = await service.createProject(values);

  if (project) {
    router.push(`/project/${project.id}`);
  } else {
    alert("Erro ao criar projeto");
  }
});
</script>

<template>
  <main class="flex w-full items-center justify-center p-5">
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

          <ProviderModelSelect
            v-model:provider="provider"
            v-model:model="model"
            v-model:detecting="detecting"
            auto-detect
            :provider-error="errors.provider"
            :model-error="errors.model"
          />

          <div class="mt-4 flex gap-2">
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
