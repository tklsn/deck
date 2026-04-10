import type { FunctionDefinition } from "../../types/tool";

// ─── Reusable schemas ────────────────────────────────────────────────────────

const documentSectionTool: FunctionDefinition = {
  name: "generate_document_section",
  description: "Gera uma seção de documento estruturada",
  parameters: {
    type: "object",
    properties: {
      section_title: { type: "string", description: "Título da seção" },
      content: { type: "string", description: "Conteúdo principal da seção, completo e detalhado" },
      items: {
        type: "array",
        description: "Lista de itens detalhados da seção",
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "Título do item" },
            description: { type: "string", description: "Descrição detalhada do item" },
          },
          required: ["title", "description"],
        },
      },
    },
    required: ["section_title", "content", "items"],
  },
};

const canvasSectionTool: FunctionDefinition = {
  name: "generate_canvas_section",
  description: "Gera uma seção de canvas estruturada",
  parameters: {
    type: "object",
    properties: {
      section_title: { type: "string", description: "Título da seção do canvas" },
      content: { type: "string", description: "Análise completa e detalhada da seção do canvas" },
      items: {
        type: "array",
        description: "Elementos listados nesta seção do canvas",
        items: {
          type: "object",
          properties: {
            label: { type: "string", description: "Rótulo do elemento" },
            value: { type: "string", description: "Valor ou descrição detalhada do elemento" },
          },
          required: ["label", "value"],
        },
      },
    },
    required: ["section_title", "content", "items"],
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
        title: { type: "string", description: "Título claro e descritivo da atividade" },
        description: { type: "string", description: "Descrição completa e detalhada da atividade" },
        objective: { type: "string", description: "Objetivo de aprendizado detalhado da atividade" },
        steps: {
          type: "array",
          description: "Passos ou tópicos importantes, com detalhamento suficiente para execução",
          items: { type: "string" },
        },
        resources: {
          type: "array",
          description: "Recursos necessários para a atividade",
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
              title: { type: "string", description: "Título do ponto essencial" },
              explanation: { type: "string", description: "Explicação detalhada e aprofundada do ponto" },
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
        content: { type: "string", description: "Texto educativo principal, completo e aprofundado, cobrindo o tema com exemplos e explicações" },
        key_concepts: {
          type: "array",
          description: "Conceitos-chave abordados no conteúdo",
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
              title: { type: "string", description: "Título ou enunciado resumido da questão" },
              body: { type: "string", description: "Corpo completo da questão com todos os detalhes necessários" },
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
        overview: { type: "string", description: "Visão geral abrangente do projeto, contexto, problema que resolve e público-alvo" },
        features: {
          type: "array",
          minItems: 10,
          description: "Lista detalhada de funcionalidades do sistema",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Nome da funcionalidade" },
              description: { type: "string", description: "Descrição detalhada da funcionalidade, comportamento esperado e valor gerado" },
            },
            required: ["name", "description"],
          },
        },
        flows: {
          type: "array",
          description: "Fluxos principais do sistema descrevendo jornadas do usuário",
          items: { type: "string" },
        },
        suggestions: {
          type: "array",
          description: "Sugestões adicionais de melhorias ou funcionalidades complementares",
          items: { type: "string" },
        },
      },
      required: ["overview", "features", "flows", "suggestions"],
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
              title: { type: "string", description: "Título descritivo da user story" },
              as_user: { type: "string", description: "Tipo de usuário que realiza a ação" },
              want: { type: "string", description: "Ação ou funcionalidade desejada pelo usuário" },
              so_that: { type: "string", description: "Benefício ou valor gerado pela funcionalidade" },
              acceptance_criteria: {
                type: "array",
                description: "Critérios de aceite detalhados e verificáveis",
                items: { type: "string" },
              },
              technical_notes: { type: "string", description: "Notas técnicas relevantes para implementação" },
              dependencies: { type: "string", description: "Dependências com outras user stories ou sistemas" },
            },
            required: ["id", "title", "as_user", "want", "so_that", "acceptance_criteria", "technical_notes", "dependencies"],
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
              title: { type: "string", description: "Título do épico" },
              description: { type: "string", description: "Descrição detalhada do épico e seu valor de negócio" },
              screens: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Nome da tela ou módulo" },
                    description: { type: "string", description: "Descrição detalhada da tela e suas funcionalidades" },
                    acceptance_criteria: {
                      type: "array",
                      description: "Critérios de aceite específicos e verificáveis",
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
                    title: { type: "string", description: "Título do cenário" },
                    given: { type: "array", description: "Pré-condições do cenário", items: { type: "string" } },
                    when: { type: "array", description: "Ações executadas no cenário", items: { type: "string" } },
                    then: { type: "array", description: "Resultados esperados do cenário", items: { type: "string" } },
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
        section_title: { type: "string", description: "Título da seção de escopo" },
        content: { type: "string", description: "Descrição completa e detalhada do escopo do projeto" },
        in_scope: { type: "array", description: "Itens explicitamente incluídos no escopo", items: { type: "string" } },
        out_of_scope: { type: "array", description: "Itens explicitamente excluídos do escopo", items: { type: "string" } },
        assumptions: { type: "array", description: "Premissas e restrições do projeto", items: { type: "string" } },
      },
      required: ["section_title", "content", "in_scope", "out_of_scope", "assumptions"],
    },
  },

  "sofia:starter:project-architecture": {
    name: "generate_architecture_section",
    description: "Gera seção do documento de arquitetura de software",
    parameters: {
      type: "object",
      properties: {
        section_title: { type: "string", description: "Título da seção de arquitetura" },
        content: { type: "string", description: "Descrição completa e detalhada da arquitetura do sistema" },
        components: {
          type: "array",
          description: "Componentes da arquitetura com tecnologias e responsabilidades",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Nome do componente" },
              description: { type: "string", description: "Responsabilidade detalhada do componente" },
              technology: { type: "string", description: "Tecnologia ou framework utilizado" },
            },
            required: ["name", "description", "technology"],
          },
        },
        decisions: { type: "array", description: "Decisões arquiteturais relevantes com justificativa", items: { type: "string" } },
      },
      required: ["section_title", "content", "components", "decisions"],
    },
  },

  "sofia:starter:project-plan": {
    name: "generate_project_plan_section",
    description: "Gera seção do plano de projeto",
    parameters: {
      type: "object",
      properties: {
        section_title: { type: "string", description: "Título da seção do plano" },
        content: { type: "string", description: "Descrição completa e detalhada do plano de projeto" },
        tasks: { type: "array", description: "Tarefas detalhadas do projeto", items: { type: "string" } },
        deliverables: { type: "array", description: "Entregas esperadas do projeto", items: { type: "string" } },
        milestones: { type: "array", description: "Marcos e pontos de verificação do projeto", items: { type: "string" } },
      },
      required: ["section_title", "content", "tasks", "deliverables", "milestones"],
    },
  },

  "sofia:starter:requirement-document": {
    name: "generate_requirements_section",
    description: "Gera seção do documento de requisitos funcionais e não funcionais",
    parameters: {
      type: "object",
      properties: {
        section_title: { type: "string", description: "Título da seção de requisitos" },
        functional_requirements: {
          type: "array",
          description: "Lista completa de requisitos funcionais do sistema",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Identificador no formato RF-N" },
              description: { type: "string", description: "Descrição detalhada e completa do requisito funcional" },
              priority: { type: "string", enum: ["alta", "média", "baixa"], description: "Prioridade do requisito" },
            },
            required: ["id", "description", "priority"],
          },
        },
        non_functional_requirements: {
          type: "array",
          description: "Lista completa de requisitos não funcionais do sistema",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Identificador no formato RNF-N" },
              description: { type: "string", description: "Descrição detalhada e completa do requisito não funcional" },
              category: { type: "string", description: "Categoria do requisito (ex: performance, segurança, usabilidade)" },
            },
            required: ["id", "description", "category"],
          },
        },
      },
      required: ["section_title", "functional_requirements", "non_functional_requirements"],
    },
  },

  // ── Sofia / Requirements Module ─────────────────────────────────────────

  "sofia:requirements-module:expand-prompt": {
    name: "expand_project_description",
    description: "Expande e melhora uma descrição de projeto com funcionalidades e fluxos",
    parameters: {
      type: "object",
      properties: {
        overview: { type: "string", description: "Visão geral abrangente do projeto, contexto, problema que resolve e público-alvo" },
        features: {
          type: "array",
          minItems: 10,
          description: "Lista detalhada de funcionalidades do sistema",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Nome da funcionalidade" },
              description: { type: "string", description: "Descrição detalhada da funcionalidade, comportamento esperado e valor gerado" },
            },
            required: ["name", "description"],
          },
        },
        flows: { type: "array", description: "Fluxos principais do sistema descrevendo jornadas do usuário", items: { type: "string" } },
        suggestions: { type: "array", description: "Sugestões adicionais de melhorias ou funcionalidades complementares", items: { type: "string" } },
      },
      required: ["overview", "features", "flows", "suggestions"],
    },
  },

  "sofia:requirements-module:project-scope": {
    name: "generate_project_scope_section",
    description: "Gera seção do documento de escopo do projeto",
    parameters: {
      type: "object",
      properties: {
        section_title: { type: "string", description: "Título da seção de escopo" },
        content: { type: "string", description: "Descrição completa e detalhada do escopo do projeto" },
        in_scope: { type: "array", description: "Itens explicitamente incluídos no escopo", items: { type: "string" } },
        out_of_scope: { type: "array", description: "Itens explicitamente excluídos do escopo", items: { type: "string" } },
        assumptions: { type: "array", description: "Premissas e restrições do projeto", items: { type: "string" } },
      },
      required: ["section_title", "content", "in_scope", "out_of_scope", "assumptions"],
    },
  },

  "sofia:requirements-module:requirement-document": {
    name: "generate_requirements_section",
    description: "Gera seção do documento de requisitos funcionais e não funcionais",
    parameters: {
      type: "object",
      properties: {
        section_title: { type: "string", description: "Título da seção de requisitos" },
        functional_requirements: {
          type: "array",
          description: "Lista completa de requisitos funcionais do sistema",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Identificador no formato RF-N" },
              description: { type: "string", description: "Descrição detalhada e completa do requisito funcional" },
              priority: { type: "string", enum: ["alta", "média", "baixa"], description: "Prioridade do requisito" },
            },
            required: ["id", "description", "priority"],
          },
        },
        non_functional_requirements: {
          type: "array",
          description: "Lista completa de requisitos não funcionais do sistema",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Identificador no formato RNF-N" },
              description: { type: "string", description: "Descrição detalhada e completa do requisito não funcional" },
              category: { type: "string", description: "Categoria do requisito (ex: performance, segurança, usabilidade)" },
            },
            required: ["id", "description", "category"],
          },
        },
      },
      required: ["section_title", "functional_requirements", "non_functional_requirements"],
    },
  },

  "sofia:requirements-module:architecture-document": {
    name: "generate_architecture_section",
    description: "Gera seção do documento de arquitetura de software",
    parameters: {
      type: "object",
      properties: {
        section_title: { type: "string", description: "Título da seção de arquitetura" },
        content: { type: "string", description: "Descrição completa e detalhada da arquitetura do sistema" },
        components: {
          type: "array",
          description: "Componentes da arquitetura com tecnologias e responsabilidades",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Nome do componente" },
              description: { type: "string", description: "Responsabilidade detalhada do componente" },
              technology: { type: "string", description: "Tecnologia ou framework utilizado" },
            },
            required: ["name", "description", "technology"],
          },
        },
        decisions: { type: "array", description: "Decisões arquiteturais relevantes com justificativa", items: { type: "string" } },
      },
      required: ["section_title", "content", "components", "decisions"],
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
