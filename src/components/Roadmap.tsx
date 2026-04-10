import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  Globe,
  Layers,
  Rocket,
  Zap,
} from "lucide-vue-next";
import { ref } from "vue";
import { Badge } from "./ui/badge";

const phases = [
  {
    id: 1,
    quarter: "Q1 2025",
    title: "Fundação",
    subtitle: "Infraestrutura & Base",
    status: "completed",
    icon: Layers,
    items: [
      { label: "Design System v1.0", done: true },
      { label: "Autenticação & RBAC", done: true },
      { label: "CI/CD Pipeline", done: true },
      { label: "Monitoramento & Logs", done: true },
    ],
  },
  {
    id: 2,
    quarter: "Q2 2025",
    title: "Crescimento",
    subtitle: "Features Core",
    status: "in-progress",
    icon: Rocket,
    items: [
      { label: "Dashboard Analytics", done: true },
      { label: "API Pública v1", done: true },
      { label: "Integrações Externas", done: false },
      { label: "App Mobile (beta)", done: false },
    ],
  },
  {
    id: 3,
    quarter: "Q3 2025",
    title: "Expansão",
    subtitle: "Escala & Otimização",
    status: "upcoming",
    icon: Globe,
    items: [
      { label: "Multi-tenancy", done: false },
      { label: "Cache Distribuído", done: false },
      { label: "Internacionalização (i18n)", done: false },
      { label: "Marketplace de Plugins", done: false },
    ],
  },
  {
    id: 4,
    quarter: "Q4 2025",
    title: "Maturidade",
    subtitle: "IA & Automação",
    status: "upcoming",
    icon: Zap,
    items: [
      { label: "Motor de Recomendação IA", done: false },
      { label: "Automação de Workflows", done: false },
      { label: "Analytics Preditivo", done: false },
      { label: "API v2 + GraphQL", done: false },
    ],
  },
];

const statusMap: Record<string, { label: string; badgeCls: string }> = {
  completed: {
    label: "Concluído",
    badgeCls: "bg-zinc-900 text-zinc-50 border-transparent",
  },
  "in-progress": {
    label: "Em Progresso",
    badgeCls: "bg-zinc-100 text-zinc-900 border-transparent",
  },
  upcoming: {
    label: "Em Breve",
    badgeCls: "bg-transparent text-zinc-500 border-zinc-200",
  },
};

function ProgressBar({ value }: any) {
  return (
    <div class="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
      <div
        class="h-full rounded-full bg-zinc-900 transition-all duration-500 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function Roadmap() {
  const openId = ref<number | null>(2);

  function setOpenId(id: number | null) {
    openId.value = id;
  }

  return (
    <div class="min-h-screen w-full p-6 md:p-12">
      <div class="max-w-2xl mx-auto">
        {/* Header */}
        <div class="mb-10">
          <Badge class="bg-transparent mb-3">Roadmap 2025</Badge>
          <h1 class="text-3xl font-bold tracking-tight ">Plano de Produto</h1>
          <p class="text-sm  mt-1">
            Acompanhe a evolução da plataforma trimestre a trimestre.
          </p>
        </div>

        {/* Timeline */}
        <div class="relative">
          {phases.map((phase, index) => {
            const isLast = index === phases.length - 1;
            const done = phase.items.filter((i) => i.done).length;
            const pct = Math.round((done / phase.items.length) * 100);
            const Icon = phase.icon;
            const isOpen = openId.value === phase.id;
            const { label, badgeCls } = statusMap[phase.status]!;

            return (
              <div key={phase.id} class="flex gap-4">
                {/* Spine */}
                <div class="flex flex-col items-center pt-6">
                  <div
                    class={`flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 transition-colors ${
                      phase.status === "completed"
                        ? "bg-zinc-900 border-zinc-900 text-white"
                        : phase.status === "in-progress"
                          ? "bg-zinc-100 border-zinc-900 text-zinc-900"
                          : "bg-zinc-50 border-zinc-200 text-zinc-400"
                    }`}
                  >
                    {phase.status === "completed" ? (
                      <CheckCircle2 class="w-4 h-4" />
                    ) : phase.status === "in-progress" ? (
                      <Clock class="w-4 h-4" />
                    ) : (
                      <Circle class="w-4 h-4" />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      class={`w-0.5 flex-1 my-1 ${
                        phase.status === "completed"
                          ? "bg-zinc-900"
                          : "bg-zinc-200"
                      }`}
                    />
                  )}
                </div>

                {/* Card */}
                <div class="flex-1 pb-6">
                  <div class="rounded-lg border border-zinc-200 bg-white shadow-sm">
                    {/* Card Header (trigger) */}
                    <button
                      onClick={() => setOpenId(isOpen ? null : phase.id)}
                      class="w-full text-left px-5 py-4 cursor-pointer"
                    >
                      <div class="flex items-start justify-between gap-2">
                        <div class="flex items-center gap-2 flex-wrap">
                          <Icon class="w-4 h-4 text-zinc-400" />
                          <Badge class={badgeCls}>{label}</Badge>
                          <span class="text-xs text-zinc-400">
                            {phase.quarter}
                          </span>
                        </div>
                        <ChevronDown
                          class={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      <h3 class="text-lg font-semibold text-zinc-900 mt-2 leading-tight">
                        {phase.title}
                      </h3>
                      <p class="text-sm text-zinc-500 mt-0.5">
                        {phase.subtitle}
                      </p>
                    </button>

                    {/* Collapsible Content */}
                    <div
                      class="overflow-hidden transition-all duration-300 ease-in-out"
                      style={{ maxHeight: isOpen ? 400 : 0 }}
                    >
                      <div class="px-5 pb-5">
                        <div class="h-px bg-zinc-200 mb-3" />

                        <ul class="space-y-2">
                          {phase.items.map((item, i) => (
                            <li key={i} class="flex items-center gap-2 text-sm">
                              {item.done ? (
                                <CheckCircle2 class="w-4 h-4 text-zinc-900 shrink-0" />
                              ) : (
                                <Circle class="w-4 h-4 text-zinc-300 shrink-0" />
                              )}
                              <span
                                class={
                                  item.done ? "text-zinc-900" : "text-zinc-400"
                                }
                              >
                                {item.label}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <div class="mt-4 space-y-1.5">
                          <div class="flex justify-between text-xs text-zinc-400">
                            <span>
                              {done}/{phase.items.length} tarefas
                            </span>
                            <span>{pct}%</span>
                          </div>
                          <ProgressBar value={pct} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Separator + Legend */}
        <div class="h-px bg-zinc-200 my-5" />
        <div class="flex flex-wrap gap-5 text-xs text-zinc-400">
          {Object.entries(statusMap).map(([key, { label: l }]) => (
            <div key={key} class="flex items-center gap-1.5">
              <span
                class={`w-2 h-2 rounded-full ${
                  key === "completed"
                    ? "bg-zinc-900"
                    : key === "in-progress"
                      ? "bg-zinc-400"
                      : "bg-zinc-300"
                }`}
              />
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
