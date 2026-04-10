import type { FunctionDefinition } from "../../types/tool";

// ─── Reusable schemas ────────────────────────────────────────────────────────

const documentSectionTool: FunctionDefinition = {
  name: "generate_document_section",
  description: "Gera uma seção de documento estruturada",
  parameters: {
    type: "object",
    properties: {
      section_title: { type: "string", description: "Título da seção" },
      content: { type: "string", description: "Conteúdo principal da seção" },
      items: {
        type: "array",
        description: "Lista de itens detalhados da seção",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
          },
          required: ["title", "description"],
        },
      },
    },
    required: ["section_title", "content"],
  },
};

const canvasSectionTool: FunctionDefinition = {
  name: "generate_canvas_section",
  description: "Gera uma seção de canvas estruturada",
  parameters: {
    type: "object",
    properties: {
      section_title: { type: "string" },
      content: { type: "string", description: "Análise ou descrição da seção" },
      items: {
        type: "array",
        description: "Elementos listados nesta seção do canvas",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            value: { type: "string" },
          },
          required: ["label", "value"],
        },
      },
    },
    required: ["section_title", "content"],
  },
};

// ─── Registry ────────────────────────────────────────────────────────────────

export const PROMPT_TOOL_DEFINITIONS: Record<string, FunctionDefinition> = {
  // ── Genius / Classroom ──────────────────────────────────────────────────

  "genius:classroom:assignment": {
    name: "create_assignment",
    description: "Cria título e descrição estruturados de uma atividade baseada no plano de aula",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Título da atividade" },
        description: { type: "string", description: "Descrição geral da atividade" },
        objective: { type: "string", description: "Objetivo da atividade" },
        steps: {
          type: "array",
          description: "Passos ou tópicos importantes",
          items: { type: "string" },
        },
        resources: {
          type: "array",
          description: "Recursos necessários",
          items: { type: "string" },
        },
      },
      required: ["title", "description", "objective", "steps", "resources"],
    },
  },

  "genius:classroom:lession-essentials": {
    name: "identify_lesson_essentials",
    description: "Identifica três pontos essenciais para se aprofundar em um tema",
    parameters: {
      type: "object",
      properties: {
        points: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              explanation: { type: "string" },
            },
            required: ["title", "explanation"],
          },
        },
      },
      required: ["points"],
    },
  },

  "genius:classroom:lession-planner": documentSectionTool,

  "genius:classroom:lession-topic": {
    name: "generate_lesson_topic_content",
    description: "Gera conteúdo educativo estruturado sobre um tópico",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "Texto educativo principal" },
        key_concepts: {
          type: "array",
          description: "Conceitos-chave abordados",
          items: { type: "string" },
        },
      },
      required: ["content", "key_concepts"],
    },
  },

  "genius:classroom:related-assignments": {
    name: "propose_related_assignments",
    description: "Propõe questões baseadas em um plano de aula",
    parameters: {
      type: "object",
      properties: {
        questions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              body: { type: "string" },
            },
            required: ["title", "body"],
          },
        },
      },
      required: ["questions"],
    },
  },

  // ── Sofia / Starter ─────────────────────────────────────────────────────

  "sofia:starter:expand-prompt": {
    name: "expand_project_description",
    description: "Expande e melhora uma descrição de projeto com funcionalidades e fluxos",
    parameters: {
      type: "object",
      properties: {
        overview: { type: "string", description: "Visão geral do projeto" },
        features: {
          type: "array",
          minItems: 10,
          description: "Funcionalidades detalhadas",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
            },
            required: ["name", "description"],
          },
        },
        flows: {
          type: "array",
          description: "Fluxos do sistema",
          items: { type: "string" },
        },
        suggestions: {
          type: "array",
          description: "Sugestões adicionais",
          items: { type: "string" },
        },
      },
      required: ["overview", "features", "flows"],
    },
  },

  "sofia:starter:user-stories": {
    name: "generate_user_stories",
    description: "Gera user stories detalhadas e estruturadas para um épico",
    parameters: {
      type: "object",
      properties: {
        stories: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Identificador no formato US-N" },
              title: { type: "string" },
              as_user: { type: "string", description: "Tipo de usuário" },
              want: { type: "string", description: "Ação ou funcionalidade desejada" },
              so_that: { type: "string", description: "Benefício ou valor gerado" },
              acceptance_criteria: {
                type: "array",
                items: { type: "string" },
              },
              technical_notes: { type: "string" },
              dependencies: { type: "string" },
            },
            required: ["id", "title", "as_user", "want", "so_that", "acceptance_criteria"],
          },
        },
      },
      required: ["stories"],
    },
  },

  "sofia:starter:epic-map": {
    name: "generate_epic_map",
    description: "Gera mapeamento de épicos com telas e critérios de aceite",
    parameters: {
      type: "object",
      properties: {
        epics: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              screens: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    acceptance_criteria: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: ["title", "description", "acceptance_criteria"],
                },
              },
            },
            required: ["title", "description", "screens"],
          },
        },
      },
      required: ["epics"],
    },
  },

  "sofia:starter:map-bdd": {
    name: "generate_bdd_scenarios",
    description: "Gera cenários BDD estruturados",
    parameters: {
      type: "object",
      properties: {
        features: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Nome da feature" },
              scenarios: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    given: { type: "array", items: { type: "string" } },
                    when: { type: "array", items: { type: "string" } },
                    then: { type: "array", items: { type: "string" } },
                  },
                  required: ["title", "given", "when", "then"],
                },
              },
            },
            required: ["name", "scenarios"],
          },
        },
      },
      required: ["features"],
    },
  },

  "sofia:starter:project-scope": {
    name: "generate_project_scope_section",
    description: "Gera seção do documento de escopo do projeto",
    parameters: {
      type: "object",
      properties: {
        section_title: { type: "string" },
        content: { type: "string" },
        in_scope: { type: "array", items: { type: "string" } },
        out_of_scope: { type: "array", items: { type: "string" } },
        assumptions: { type: "array", items: { type: "string" } },
      },
      required: ["section_title", "content"],
    },
  },

  "sofia:starter:project-architecture": {
    name: "generate_architecture_section",
    description: "Gera seção do documento de arquitetura de software",
    parameters: {
      type: "object",
      properties: {
        section_title: { type: "string" },
        content: { type: "string" },
        components: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              technology: { type: "string" },
            },
            required: ["name", "description"],
          },
        },
        decisions: { type: "array", items: { type: "string" } },
      },
      required: ["section_title", "content"],
    },
  },

  "sofia:starter:project-plan": {
    name: "generate_project_plan_section",
    description: "Gera seção do plano de projeto",
    parameters: {
      type: "object",
      properties: {
        section_title: { type: "string" },
        content: { type: "string" },
        tasks: { type: "array", items: { type: "string" } },
        deliverables: { type: "array", items: { type: "string" } },
        milestones: { type: "array", items: { type: "string" } },
      },
      required: ["section_title", "content"],
    },
  },

  "sofia:starter:requirement-document": {
    name: "generate_requirements_section",
    description: "Gera seção do documento de requisitos funcionais e não funcionais",
    parameters: {
      type: "object",
      properties: {
        section_title: { type: "string" },
        functional_requirements: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              description: { type: "string" },
              priority: { type: "string", enum: ["alta", "média", "baixa"] },
            },
            required: ["id", "description"],
          },
        },
        non_functional_requirements: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              description: { type: "string" },
              category: { type: "string" },
            },
            required: ["id", "description"],
          },
        },
      },
      required: ["section_title"],
    },
  },

  // ── Sofia / Requirements Module ─────────────────────────────────────────

  "sofia:requirements-module:expand-prompt": {
    name: "expand_project_description",
    description: "Expande e melhora uma descrição de projeto com funcionalidades e fluxos",
    parameters: {
      type: "object",
      properties: {
        overview: { type: "string" },
        features: {
          type: "array",
          minItems: 10,
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
            },
            required: ["name", "description"],
          },
        },
        flows: { type: "array", items: { type: "string" } },
        suggestions: { type: "array", items: { type: "string" } },
      },
      required: ["overview", "features", "flows"],
    },
  },

  "sofia:requirements-module:project-scope": {
    name: "generate_project_scope_section",
    description: "Gera seção do documento de escopo do projeto",
    parameters: {
      type: "object",
      properties: {
        section_title: { type: "string" },
        content: { type: "string" },
        in_scope: { type: "array", items: { type: "string" } },
        out_of_scope: { type: "array", items: { type: "string" } },
        assumptions: { type: "array", items: { type: "string" } },
      },
      required: ["section_title", "content"],
    },
  },

  "sofia:requirements-module:requirement-document": {
    name: "generate_requirements_section",
    description: "Gera seção do documento de requisitos funcionais e não funcionais",
    parameters: {
      type: "object",
      properties: {
        section_title: { type: "string" },
        functional_requirements: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              description: { type: "string" },
              priority: { type: "string", enum: ["alta", "média", "baixa"] },
            },
            required: ["id", "description"],
          },
        },
        non_functional_requirements: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              description: { type: "string" },
              category: { type: "string" },
            },
            required: ["id", "description"],
          },
        },
      },
      required: ["section_title"],
    },
  },

  "sofia:requirements-module:architecture-document": {
    name: "generate_architecture_section",
    description: "Gera seção do documento de arquitetura de software",
    parameters: {
      type: "object",
      properties: {
        section_title: { type: "string" },
        content: { type: "string" },
        components: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              technology: { type: "string" },
            },
            required: ["name", "description"],
          },
        },
        decisions: { type: "array", items: { type: "string" } },
      },
      required: ["section_title", "content"],
    },
  },

  // ── Sofia / AI Design ───────────────────────────────────────────────────
  // All aidesign prompts share the same canvas section structure

  "sofia:aidesign:ideation_gdm": canvasSectionTool,
  "sofia:aidesign:ideation_pdm": canvasSectionTool,
  "sofia:aidesign:ideation_rpm": canvasSectionTool,
  "sofia:aidesign:ideation_sim": canvasSectionTool,
  "sofia:aidesign:immersion_dim": canvasSectionTool,
  "sofia:aidesign:immersion_dsm": canvasSectionTool,
  "sofia:aidesign:immersion_pgm": canvasSectionTool,
  "sofia:aidesign:production_cmplm": canvasSectionTool,
  "sofia:aidesign:production_cntlm": canvasSectionTool,
  "sofia:aidesign:production_ctxlm": canvasSectionTool,
  "sofia:aidesign:production_dlm": canvasSectionTool,
  "sofia:aidesign:production_mttm": canvasSectionTool,
  "sofia:aidesign:validation_dpm": canvasSectionTool,
  "sofia:aidesign:validation_gdep": canvasSectionTool,
  "sofia:aidesign:validation_sim": canvasSectionTool,
};
