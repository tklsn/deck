import { ref, watch, type Ref } from "vue";
import { ExternalLLMModelsAdapter } from "../adapters/LLMsManagement/ExternalLLMModelsAdapter";
import { LocalLLMModelsAdapter } from "../adapters/LLMsManagement/LocalLLMModelsAdapter";
import type { LocalLLMModel } from "../ports/UtilsAndLLMs/LocalLLMModelsPort";
import type { ExternalLLMProvider } from "../services/external_llm";
import { getApiKey } from "../services/provider_settings";

export type ProviderValue =
  | "ollama"
  | "lmstudio"
  | "openai"
  | "anthropic"
  | "openrouter";

export interface ProviderEntry {
  value: ProviderValue;
  label: string;
  enabled: boolean;
  icon: string;
}

const DEFAULT_PROVIDERS: ProviderEntry[] = [
  {
    value: "ollama",
    label: "Ollama",
    enabled: false,
    icon: "https://ollama.com/public/icon-16x16.png",
  },
  {
    value: "lmstudio",
    label: "LM Studio",
    enabled: false,
    icon: "https://lmstudio.ai/favicon.ico",
  },
  {
    value: "openai",
    label: "OpenAI",
    enabled: false,
    icon: "https://openai.com/favicon.ico",
  },
  {
    value: "anthropic",
    label: "Anthropic",
    enabled: false,
    icon: "https://www.anthropic.com/favicon.ico",
  },
  {
    value: "openrouter",
    label: "OpenRouter",
    enabled: false,
    icon: "https://openrouter.ai/favicon.ico",
  },
];

type SupportedExternalProvider = Extract<
  ProviderValue,
  "openai" | "anthropic" | "openrouter"
>;

const EXTERNAL: SupportedExternalProvider[] = [
  "openai",
  "anthropic",
  "openrouter",
];

function isExternal(p: ProviderValue): p is SupportedExternalProvider {
  return (EXTERNAL as readonly string[]).includes(p);
}

export interface UseProviderModelSelectOptions {
  provider: Ref<ProviderValue | undefined | "">;
  setProvider: (value: ProviderValue) => void;
  setModel: (id: string) => void;
}

export function useProviderModelSelect(opts: UseProviderModelSelectOptions) {
  const providers = ref<ProviderEntry[]>(
    DEFAULT_PROVIDERS.map((p) => ({ ...p })),
  );
  const availableModels = ref<LocalLLMModel[]>([]);
  const detecting = ref(false);
  const loadingModels = ref(false);
  const apiKeyMissing = ref(false);
  let suppressWatch = false;

  async function tryListLocal(
    p: "ollama" | "lmstudio",
  ): Promise<LocalLLMModel[] | null> {
    try {
      return await new LocalLLMModelsAdapter({ provider: p }).listModels();
    } catch {
      return null;
    }
  }

  function findEntry(v: ProviderValue): ProviderEntry {
    return providers.value.find((p) => p.value === v)!;
  }

  async function loadModels(p: ProviderValue): Promise<void> {
    loadingModels.value = true;
    apiKeyMissing.value = false;
    availableModels.value = [];
    opts.setModel("");
    try {
      if (isExternal(p)) {
        const apiKey = getApiKey(p);
        if (!apiKey) {
          apiKeyMissing.value = true;
          return;
        }
        const models = await new ExternalLLMModelsAdapter(
          p as ExternalLLMProvider,
          apiKey,
        ).listModels();
        availableModels.value = models;
        if (models.length > 0) opts.setModel(models[0]!.id);
      } else {
        const models = await new LocalLLMModelsAdapter({
          provider: p,
        }).listModels();
        availableModels.value = models;
        if (models.length > 0) opts.setModel(models[0]!.id);
      }
    } catch {
      availableModels.value = [];
    } finally {
      loadingModels.value = false;
    }
  }

  async function detect(initial?: {
    provider?: ProviderValue;
    model?: string;
  }): Promise<void> {
    detecting.value = true;
    suppressWatch = true;
    availableModels.value = [];
    apiKeyMissing.value = false;
    try {
      const [ollamaModels, lmstudioModels] = await Promise.all([
        tryListLocal("ollama"),
        tryListLocal("lmstudio"),
      ]);
      findEntry("ollama").enabled = ollamaModels !== null;
      findEntry("lmstudio").enabled = lmstudioModels !== null;
      for (const ext of EXTERNAL) {
        findEntry(ext).enabled = getApiKey(ext) !== null;
      }

      const currentValue = (opts.provider.value ?? undefined) as
        | ProviderValue
        | undefined;
      let target: ProviderValue | undefined = initial?.provider ?? currentValue;
      if (!target || !findEntry(target).enabled) {
        target = providers.value.find((p) => p.enabled)?.value;
      }
      if (!target) return;

      opts.setProvider(target);

      const cached =
        target === "ollama"
          ? ollamaModels
          : target === "lmstudio"
            ? lmstudioModels
            : null;

      if (cached !== null) {
        availableModels.value = cached;
        const wantedModel =
          initial?.model && cached.some((m) => m.id === initial.model)
            ? initial.model
            : cached[0]?.id ?? "";
        opts.setModel(wantedModel);
      } else {
        await loadModels(target);
        if (
          initial?.model &&
          availableModels.value.some((m) => m.id === initial.model)
        ) {
          opts.setModel(initial.model);
        }
      }
    } finally {
      detecting.value = false;
      suppressWatch = false;
    }
  }

  watch(
    () => opts.provider.value,
    (newProvider) => {
      if (suppressWatch || !newProvider) return;
      loadModels(newProvider as ProviderValue);
    },
    { flush: "sync" },
  );

  return {
    providers,
    availableModels,
    detecting,
    loadingModels,
    apiKeyMissing,
    detect,
    loadModels,
  };
}
