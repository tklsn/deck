<script setup lang="ts">
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useProviderModelSelect,
  type ProviderValue,
} from "@/core/composables/useProviderModelSelect";
import { Icon } from "@iconify/vue";
import { computed, onMounted, watch } from "vue";

const provider = defineModel<ProviderValue | undefined | "">("provider", {
  default: undefined,
});
const model = defineModel<string>("model", { default: "" });
const detectingModel = defineModel<boolean>("detecting", { default: false });

const props = withDefaults(
  defineProps<{
    providerError?: string;
    modelError?: string;
    initialProvider?: ProviderValue;
    initialModel?: string;
    autoDetect?: boolean;
  }>(),
  { autoDetect: false },
);

const {
  providers,
  availableModels,
  detecting,
  loadingModels,
  apiKeyMissing,
  detect,
  loadModels,
} = useProviderModelSelect({
  provider,
  setProvider: (v) => {
    provider.value = v;
  },
  setModel: (id) => {
    model.value = id;
  },
});

watch(detecting, (v) => {
  detectingModel.value = v;
});

onMounted(() => {
  if (props.autoDetect) {
    detect({
      provider: props.initialProvider,
      model: props.initialModel,
    });
  }
});

defineExpose({ detect, loadModels });

const selectedProvider = computed(() =>
  providers.value.find((p) => p.value === provider.value),
);
</script>

<template>
  <Field>
    <FieldLabel>Provedor de IA</FieldLabel>
    <Select v-model="provider" :disabled="detecting">
      <SelectTrigger :aria-invalid="!!providerError">
        <SelectValue placeholder="Selecionar">
          <div
            v-if="provider && selectedProvider"
            class="flex items-center gap-2"
          >
            <img
              :src="selectedProvider.icon"
              alt=""
              class="h-4 w-4 rounded-sm"
            />
            <span>{{ selectedProvider.label }}</span>
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
            <img :src="option.icon" alt="" class="h-4 w-4 rounded-sm" />
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
    <p
      v-if="detecting"
      class="text-muted-foreground flex items-center gap-1.5 text-xs"
    >
      <Icon icon="lucide:loader" class="h-3 w-3 animate-spin" />
      Detectando provedores disponíveis...
    </p>
    <FieldError v-if="providerError" :errors="[providerError]" />
  </Field>

  <Field>
    <FieldLabel>Modelo</FieldLabel>
    <Select
      v-model="model"
      :disabled="loadingModels || availableModels.length === 0"
    >
      <SelectTrigger :aria-invalid="!!modelError">
        <SelectValue placeholder="Selecionar modelo" />
      </SelectTrigger>
      <SelectContent position="item-aligned">
        <SelectItem v-for="m in availableModels" :key="m.id" :value="m.id">
          {{ m.name }}
        </SelectItem>
      </SelectContent>
    </Select>
    <p v-if="loadingModels" class="text-muted-foreground text-xs">
      Carregando modelos...
    </p>
    <p
      v-else-if="apiKeyMissing"
      class="text-muted-foreground flex items-center gap-1.5 text-xs"
    >
      <Icon icon="lucide:key" class="h-3 w-3" />
      Configure a API key deste provedor nas configurações do aplicativo.
    </p>
    <p
      v-else-if="provider && availableModels.length === 0"
      class="text-muted-foreground text-xs"
    >
      Nenhum modelo encontrado.
    </p>
    <FieldError v-if="modelError" :errors="[modelError]" />
  </Field>
</template>
