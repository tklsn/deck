import type { FunctionDefinition } from "../../types/tool";

// ─── Reusable schemas ────────────────────────────────────────────────────────

const documentSectionTool: FunctionDefinition = {
  name: "generate_document_section",
  description:
    "Gera uma seção de documento estruturada. Todos os campos são obrigatórios e devem ser preenchidos com profundidade máxima — sem respostas genéricas, ilustrativas ou incompletas.",
  parameters: {
    type: "object",
    properties: {
      section_title: {
        type: "string",
        description:
          "Título claro e específico da seção, que reflita exatamente o conteúdo que será gerado.",
      },
      content: {
        type: "string",
        description:
          "Conteúdo principal da seção. Deve ser extenso, aprofundado e completo — com explicações detalhadas, exemplos concretos e raciocínio elaborado. Evite resumos ou frases vagas.",
      },
      items: {
        type: "array",
        description:
          "Lista de itens detalhados da seção. Inclua todos os itens relevantes — não omita nenhum por brevidade.",
        items: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Título descritivo e específico do item.",
            },
            description: {
              type: "string",
              description:
                "Descrição completa e aprofundada do item. Deve cobrir contexto, justificativa, comportamento esperado e implicações práticas.",
            },
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
  description:
    "Gera uma seção de canvas estruturada. Todos os campos são obrigatórios e devem ser preenchidos com o máximo de detalhamento possível — análises superficiais ou genéricas não são aceitáveis.",
  parameters: {
    type: "object",
    properties: {
      section_title: {
        type: "string",
        description:
          "Título exato e representativo da seção do canvas, conforme o contexto fornecido.",
      },
      content: {
        type: "string",
        description:
          "Análise completa, aprofundada e específica da seção do canvas. Deve incluir raciocínio estratégico, evidências, hipóteses e implicações. Evite generalidades.",
      },
      items: {
        type: "array",
        description:
          "Elementos concretos desta seção do canvas. Liste todos os elementos relevantes com descrições detalhadas — não agrupe itens distintos nem use placeholders.",
        items: {
          type: "object",
          properties: {
            label: {
              type: "string",
              description: "Rótulo preciso e específico do elemento.",
            },
            value: {
              type: "string",
              description:
                "Valor ou descrição detalhada do elemento — deve ser autoexplicativo, com contexto suficiente para compreensão sem referência externa.",
            },
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
    description:
      "Cria título e descrição estruturados de uma atividade baseada no plano de aula. Todos os campos são obrigatórios e devem ser preenchidos com profundidade real — inclua detalhes suficientes para que a atividade seja executável sem informações adicionais.",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "Título claro, específico e descritivo da atividade — deve comunicar exatamente o que será feito.",
        },
        description: {
          type: "string",
          description:
            "Descrição completa da atividade, incluindo contexto, propósito e formato de execução. Deve ser autoexplicativa.",
        },
        objective: {
          type: "string",
          description:
            "Objetivo de aprendizado detalhado: o que o aluno saberá ou será capaz de fazer ao concluir a atividade. Use verbos de ação específicos.",
        },
        steps: {
          type: "array",
          description:
            "Passos sequenciais para execução da atividade. Cada passo deve ser uma instrução clara e acionável — não agrupe múltiplas ações em um único item.",
          items: {
            type: "string",
            description:
              "Instrução detalhada de um único passo, com contexto suficiente para execução independente.",
          },
        },
        resources: {
          type: "array",
          description:
            "Todos os recursos necessários para a atividade — materiais, ferramentas, leituras, acesso a sistemas, etc. Não omita nenhum recurso necessário.",
          items: {
            type: "string",
            description:
              "Recurso específico com descrição de como será utilizado.",
          },
        },
      },
      required: ["title", "description", "objective", "steps", "resources"],
    },
  },

  "genius:classroom:lession-essentials": {
    name: "identify_lesson_essentials",
    description:
      "Identifica exatamente três pontos essenciais para aprofundamento em um tema. Cada ponto deve ser substancial, com explicação que vá além do superficial — aborde nuances, conexões e implicações práticas.",
    parameters: {
      type: "object",
      properties: {
        points: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          description:
            "Exatamente três pontos essenciais. Cada um deve cobrir um aspecto distinto e relevante do tema, com explicação aprofundada.",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description:
                  "Título do ponto essencial — específico e representativo do conteúdo.",
              },
              explanation: {
                type: "string",
                description:
                  "Explicação aprofundada do ponto: por que é essencial, o que ele abrange, quais são suas implicações e como se conecta ao tema geral. Não use frases genéricas.",
              },
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
    description:
      "Gera conteúdo educativo estruturado sobre um tópico. O conteúdo deve ser completo o suficiente para ser usado diretamente em uma aula — com exemplos, explicações e conceitos claramente definidos.",
    parameters: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description:
            "Texto educativo principal: completo, aprofundado e didático. Deve cobrir o tema com exemplos concretos, analogias úteis e explicações que progridam do conceito básico ao avançado. Não use marcadores ou listas neste campo — escreva em prosa estruturada.",
        },
        key_concepts: {
          type: "array",
          description:
            "Todos os conceitos-chave abordados no conteúdo. Liste cada conceito separadamente — não agrupe. Inclua todos os termos técnicos, definições e ideias centrais.",
          items: {
            type: "string",
            description: "Conceito-chave com definição breve incorporada.",
          },
        },
      },
      required: ["content", "key_concepts"],
    },
  },

  "genius:classroom:related-assignments": {
    name: "propose_related_assignments",
    description:
      "Propõe questões baseadas em um plano de aula. Cada questão deve ser completa, com enunciado suficientemente detalhado para ser respondida sem contexto adicional.",
    parameters: {
      type: "object",
      properties: {
        questions: {
          type: "array",
          description:
            "Lista de questões propostas. Varie os tipos (dissertativa, análise de caso, prática) e níveis de complexidade. Não omita questões por brevidade.",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description:
                  "Título ou enunciado resumido que identifica a questão.",
              },
              body: {
                type: "string",
                description:
                  "Corpo completo da questão com todos os detalhes, contexto, dados fornecidos e instruções de resposta. Deve ser autocontido.",
              },
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
    description:
      "Expande e melhora uma descrição de projeto. Todos os campos são obrigatórios — preencha com profundidade máxima. Evite funcionalidades genéricas ('CRUD básico', 'tela de login') sem contexto específico do projeto.",
    parameters: {
      type: "object",
      properties: {
        overview: {
          type: "string",
          description:
            "Visão geral abrangente do projeto: contexto de negócio, problema que resolve, público-alvo, diferencial competitivo e valor gerado. Deve ser suficientemente detalhada para substituir um briefing verbal.",
        },
        features: {
          type: "array",
          minItems: 10,
          description:
            "Lista completa de funcionalidades do sistema — mínimo de 10. Para cada uma, descreva o comportamento esperado, os casos de uso cobertos e o valor gerado ao usuário.",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Nome específico e descritivo da funcionalidade.",
              },
              description: {
                type: "string",
                description:
                  "Descrição detalhada: o que faz, como funciona, quem usa, quais regras de negócio se aplicam e qual valor entrega. Não use linguagem vaga.",
              },
            },
            required: ["name", "description"],
          },
        },
        flows: {
          type: "array",
          description:
            "Fluxos principais do sistema descrevendo jornadas completas do usuário — do ponto de entrada ao objetivo final. Inclua variações relevantes e casos de borda.",
          items: {
            type: "string",
            description:
              "Descrição completa de um fluxo: ator, ponto de partida, passos sequenciais e resultado esperado.",
          },
        },
        suggestions: {
          type: "array",
          description:
            "Sugestões adicionais de melhorias, funcionalidades complementares ou integrações que agregariam valor ao produto. Justifique cada sugestão brevemente.",
          items: {
            type: "string",
            description: "Sugestão específica com justificativa de valor.",
          },
        },
      },
      required: ["overview", "features", "flows", "suggestions"],
    },
  },

  "sofia:starter:user-stories": {
    name: "generate_user_stories",
    description:
      "Gera user stories detalhadas e estruturadas para um épico. Todas as histórias devem ser completas e implementáveis — critérios de aceite devem ser verificáveis e suficientemente granulares.",
    parameters: {
      type: "object",
      properties: {
        stories: {
          type: "array",
          description:
            "Lista completa de user stories do épico. Inclua todas as histórias necessárias para cobrir o escopo — não agrupe funcionalidades distintas em uma única história.",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description:
                  "Identificador único no formato US-N (ex: US-1, US-2).",
              },
              title: {
                type: "string",
                description:
                  "Título descritivo que resume a intenção da história.",
              },
              as_user: {
                type: "string",
                description:
                  "Tipo de usuário ou papel que realiza a ação — seja específico (ex: 'administrador do sistema', não apenas 'usuário').",
              },
              want: {
                type: "string",
                description:
                  "Ação ou funcionalidade desejada — descrita de forma concreta e sem ambiguidade.",
              },
              so_that: {
                type: "string",
                description:
                  "Benefício ou valor gerado pela funcionalidade — deve justificar claramente a necessidade da história.",
              },
              acceptance_criteria: {
                type: "array",
                description:
                  "Critérios de aceite detalhados e verificáveis. Cada critério deve ser testável independentemente — use o formato 'Dado X, quando Y, então Z' ou afirmações objetivas.",
                items: {
                  type: "string",
                  description: "Critério de aceite verificável e não ambíguo.",
                },
              },
              technical_notes: {
                type: "string",
                description:
                  "Notas técnicas relevantes para implementação: restrições, padrões a seguir, integrações necessárias, pontos de atenção de segurança ou performance.",
              },
              dependencies: {
                type: "string",
                description:
                  "Dependências com outras user stories, épicos, sistemas externos ou pré-requisitos técnicos. Use 'Nenhuma' se não houver.",
              },
            },
            required: [
              "id",
              "title",
              "as_user",
              "want",
              "so_that",
              "acceptance_criteria",
              "technical_notes",
              "dependencies",
            ],
          },
        },
      },
      required: ["stories"],
    },
  },

  "sofia:starter:epic-map": {
    name: "generate_epic_map",
    description:
      "Gera mapeamento completo de épicos com telas e critérios de aceite. Todos os campos são obrigatórios — cada épico e tela deve ter descrição suficientemente detalhada para orientar design e desenvolvimento.",
    parameters: {
      type: "object",
      properties: {
        epics: {
          type: "array",
          description:
            "Lista completa de épicos do produto. Cubra todos os módulos e áreas funcionais — não omita épicos por brevidade.",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description:
                  "Título do épico — específico e representativo do módulo funcional.",
              },
              description: {
                type: "string",
                description:
                  "Descrição detalhada do épico: escopo, valor de negócio, usuários envolvidos e como se integra ao produto como um todo.",
              },
              screens: {
                type: "array",
                description:
                  "Todas as telas ou módulos que compõem o épico. Inclua cada tela separadamente — não agrupe telas distintas.",
                items: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      description: "Nome específico da tela ou módulo.",
                    },
                    description: {
                      type: "string",
                      description:
                        "Descrição detalhada da tela: propósito, elementos principais, ações disponíveis, estados possíveis e fluxos de navegação.",
                    },
                    acceptance_criteria: {
                      type: "array",
                      description:
                        "Critérios de aceite específicos e verificáveis para esta tela. Cada critério deve ser testável independentemente.",
                      items: {
                        type: "string",
                        description:
                          "Critério de aceite objetivo e verificável.",
                      },
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
    description:
      "Gera cenários BDD estruturados e completos. Cada cenário deve ser autocontido e executável — Given/When/Then devem cobrir o contexto completo sem depender de conhecimento implícito.",
    parameters: {
      type: "object",
      properties: {
        features: {
          type: "array",
          description:
            "Lista de features com seus cenários BDD. Inclua todas as features relevantes — não agrupe comportamentos distintos.",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description:
                  "Nome da feature — descreva o comportamento de negócio, não a implementação técnica.",
              },
              scenarios: {
                type: "array",
                description:
                  "Todos os cenários da feature, incluindo o caminho feliz e os principais casos alternativos e de erro.",
                items: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      description:
                        "Título do cenário — deve identificar claramente o comportamento testado.",
                    },
                    given: {
                      type: "array",
                      description:
                        "Pré-condições completas do cenário. Inclua todos os estados e contextos necessários para executar o teste.",
                      items: {
                        type: "string",
                        description: "Pré-condição específica e verificável.",
                      },
                    },
                    when: {
                      type: "array",
                      description:
                        "Ações executadas no cenário. Descreva cada ação de forma atômica e sequencial.",
                      items: {
                        type: "string",
                        description: "Ação específica executada pelo ator.",
                      },
                    },
                    then: {
                      type: "array",
                      description:
                        "Resultados esperados verificáveis. Cada item deve ser assertivo e mensurável.",
                      items: {
                        type: "string",
                        description:
                          "Resultado esperado específico e verificável.",
                      },
                    },
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
    description:
      "Gera seção completa do documento de escopo do projeto. Todos os campos são obrigatórios — o documento deve ser suficientemente detalhado para alinhar todas as partes envolvidas sem ambiguidade.",
    parameters: {
      type: "object",
      properties: {
        section_title: {
          type: "string",
          description:
            "Título da seção de escopo — representativo do conteúdo gerado.",
        },
        content: {
          type: "string",
          description:
            "Descrição completa e detalhada do escopo: contexto do projeto, objetivos gerais, abordagem adotada e critérios de sucesso. Deve ser suficientemente rica para orientar decisões de projeto.",
        },
        in_scope: {
          type: "array",
          description:
            "Todos os itens explicitamente incluídos no escopo. Seja específico — evite itens genéricos que gerem dupla interpretação.",
          items: {
            type: "string",
            description: "Item de escopo específico e verificável.",
          },
        },
        out_of_scope: {
          type: "array",
          description:
            "Todos os itens explicitamente excluídos do escopo. Inclua tudo que possa ser assumido como incluído mas não está — previne mal-entendidos futuros.",
          items: {
            type: "string",
            description:
              "Item fora do escopo com justificativa brevemente integrada.",
          },
        },
        assumptions: {
          type: "array",
          description:
            "Todas as premissas, dependências externas e restrições do projeto. Inclua premissas técnicas, de negócio, de recursos e de prazo.",
          items: {
            type: "string",
            description:
              "Premissa ou restrição específica com impacto no projeto.",
          },
        },
      },
      required: [
        "section_title",
        "content",
        "in_scope",
        "out_of_scope",
        "assumptions",
      ],
    },
  },

  "sofia:starter:project-architecture": {
    name: "generate_architecture_section",
    description:
      "Gera seção completa do documento de arquitetura de software. Todos os campos são obrigatórios — as decisões arquiteturais devem ser justificadas e os componentes descritos com responsabilidades claras.",
    parameters: {
      type: "object",
      properties: {
        section_title: {
          type: "string",
          description: "Título da seção de arquitetura.",
        },
        content: {
          type: "string",
          description:
            "Descrição completa da arquitetura: visão geral do sistema, padrões adotados, estrutura de camadas, estratégia de comunicação entre componentes e considerações de escalabilidade e segurança.",
        },
        components: {
          type: "array",
          description:
            "Todos os componentes da arquitetura. Inclua cada componente separadamente — não agrupe responsabilidades distintas.",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Nome específico do componente.",
              },
              description: {
                type: "string",
                description:
                  "Responsabilidade detalhada do componente: o que faz, o que não faz, com quem se comunica e quais contratos expõe.",
              },
              technology: {
                type: "string",
                description:
                  "Tecnologia, framework ou linguagem utilizada — seja específico (ex: 'Node.js 20 com Fastify', não apenas 'backend').",
              },
            },
            required: ["name", "description", "technology"],
          },
        },
        decisions: {
          type: "array",
          description:
            "Todas as decisões arquiteturais relevantes com justificativa. Inclua alternativas consideradas e motivo da escolha adotada.",
          items: {
            type: "string",
            description:
              "Decisão arquitetural com contexto, alternativas e justificativa.",
          },
        },
      },
      required: ["section_title", "content", "components", "decisions"],
    },
  },

  "sofia:starter:project-plan": {
    name: "generate_project_plan_section",
    description:
      "Gera seção completa do plano de projeto. Todos os campos são obrigatórios — o plano deve ser suficientemente detalhado para orientar a execução sem necessidade de refinamento adicional.",
    parameters: {
      type: "object",
      properties: {
        section_title: {
          type: "string",
          description: "Título da seção do plano.",
        },
        content: {
          type: "string",
          description:
            "Descrição completa do plano: abordagem de execução, metodologia, estratégia de riscos, dependências críticas e critérios de sucesso da fase.",
        },
        tasks: {
          type: "array",
          description:
            "Lista detalhada de todas as tarefas do projeto. Cada tarefa deve ser granular o suficiente para ser estimada e atribuída individualmente.",
          items: {
            type: "string",
            description:
              "Tarefa específica com contexto suficiente para execução — inclua entregável esperado quando relevante.",
          },
        },
        deliverables: {
          type: "array",
          description:
            "Todas as entregas esperadas do projeto — artefatos, documentos, funcionalidades ou sistemas que serão produzidos.",
          items: {
            type: "string",
            description:
              "Entregável específico com critério de conclusão implícito ou explícito.",
          },
        },
        milestones: {
          type: "array",
          description:
            "Marcos e pontos de verificação do projeto. Inclua marcos de negócio e técnicos — datas ou condições de conclusão devem ser inferíveis do contexto.",
          items: {
            type: "string",
            description: "Marco específico com critério de atingimento claro.",
          },
        },
      },
      required: [
        "section_title",
        "content",
        "tasks",
        "deliverables",
        "milestones",
      ],
    },
  },

  "sofia:starter:requirement-document": {
    name: "generate_requirements_section",
    description:
      "Gera seção completa do documento de requisitos funcionais e não funcionais. Todos os campos são obrigatórios — cada requisito deve ser único, específico, verificável e livre de ambiguidade.",
    parameters: {
      type: "object",
      properties: {
        section_title: {
          type: "string",
          description: "Título da seção de requisitos.",
        },
        functional_requirements: {
          type: "array",
          description:
            "Lista completa de requisitos funcionais. Cubra todas as funcionalidades do sistema — não omita requisitos por considerar óbvios.",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description:
                  "Identificador único no formato RF-N (ex: RF-1, RF-2).",
              },
              description: {
                type: "string",
                description:
                  "Descrição detalhada e completa do requisito funcional: comportamento esperado do sistema, regras de negócio aplicáveis, entradas e saídas envolvidas.",
              },
              priority: {
                type: "string",
                enum: ["alta", "média", "baixa"],
                description: "Prioridade do requisito para o produto.",
              },
            },
            required: ["id", "description", "priority"],
          },
        },
        non_functional_requirements: {
          type: "array",
          description:
            "Lista completa de requisitos não funcionais. Inclua requisitos de performance, segurança, usabilidade, disponibilidade, manutenibilidade e conformidade.",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description:
                  "Identificador único no formato RNF-N (ex: RNF-1, RNF-2).",
              },
              description: {
                type: "string",
                description:
                  "Descrição detalhada do requisito não funcional com métricas ou critérios de aceitação quando aplicável (ex: 'tempo de resposta inferior a 200ms para 95% das requisições').",
              },
              category: {
                type: "string",
                description:
                  "Categoria do requisito — seja específico (ex: 'performance', 'segurança', 'usabilidade', 'disponibilidade', 'conformidade', 'manutenibilidade').",
              },
            },
            required: ["id", "description", "category"],
          },
        },
      },
      required: [
        "section_title",
        "functional_requirements",
        "non_functional_requirements",
      ],
    },
  },

  // ── Sofia / Requirements Module ─────────────────────────────────────────

  "sofia:requirements-module:expand-prompt": {
    name: "expand_project_description",
    description:
      "Expande e melhora uma descrição de projeto. Todos os campos são obrigatórios — preencha com profundidade máxima. Evite funcionalidades genéricas sem contexto específico do projeto.",
    parameters: {
      type: "object",
      properties: {
        overview: {
          type: "string",
          description:
            "Visão geral abrangente do projeto: contexto de negócio, problema que resolve, público-alvo, diferencial competitivo e valor gerado. Deve ser suficientemente detalhada para substituir um briefing verbal.",
        },
        features: {
          type: "array",
          minItems: 10,
          description:
            "Lista completa de funcionalidades do sistema — mínimo de 10. Para cada uma, descreva o comportamento esperado, os casos de uso cobertos e o valor gerado ao usuário.",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Nome específico e descritivo da funcionalidade.",
              },
              description: {
                type: "string",
                description:
                  "Descrição detalhada: o que faz, como funciona, quem usa, quais regras de negócio se aplicam e qual valor entrega.",
              },
            },
            required: ["name", "description"],
          },
        },
        flows: {
          type: "array",
          description:
            "Fluxos principais do sistema descrevendo jornadas completas do usuário — do ponto de entrada ao objetivo final. Inclua variações relevantes e casos de borda.",
          items: {
            type: "string",
            description:
              "Descrição completa de um fluxo: ator, ponto de partida, passos sequenciais e resultado esperado.",
          },
        },
        suggestions: {
          type: "array",
          description:
            "Sugestões adicionais de melhorias, funcionalidades complementares ou integrações que agregariam valor. Justifique cada sugestão brevemente.",
          items: {
            type: "string",
            description: "Sugestão específica com justificativa de valor.",
          },
        },
      },
      required: ["overview", "features", "flows", "suggestions"],
    },
  },

  "sofia:requirements-module:project-scope": {
    name: "generate_project_scope_section",
    description:
      "Gera seção completa do documento de escopo do projeto. Todos os campos são obrigatórios — o documento deve ser suficientemente detalhado para alinhar todas as partes sem ambiguidade.",
    parameters: {
      type: "object",
      properties: {
        section_title: {
          type: "string",
          description: "Título da seção de escopo.",
        },
        content: {
          type: "string",
          description:
            "Descrição completa e detalhada do escopo: contexto, objetivos gerais, abordagem e critérios de sucesso.",
        },
        in_scope: {
          type: "array",
          description:
            "Todos os itens explicitamente incluídos no escopo — específicos e verificáveis.",
          items: {
            type: "string",
            description: "Item de escopo específico e verificável.",
          },
        },
        out_of_scope: {
          type: "array",
          description:
            "Todos os itens explicitamente excluídos do escopo. Inclua tudo que possa ser assumido como incluído mas não está.",
          items: {
            type: "string",
            description:
              "Item fora do escopo com justificativa brevemente integrada.",
          },
        },
        assumptions: {
          type: "array",
          description:
            "Todas as premissas, dependências externas e restrições do projeto — técnicas, de negócio, de recursos e de prazo.",
          items: {
            type: "string",
            description:
              "Premissa ou restrição específica com impacto no projeto.",
          },
        },
      },
      required: [
        "section_title",
        "content",
        "in_scope",
        "out_of_scope",
        "assumptions",
      ],
    },
  },

  "sofia:requirements-module:requirement-document": {
    name: "generate_requirements_section",
    description:
      "Gera seção completa do documento de requisitos funcionais e não funcionais. Todos os campos são obrigatórios — cada requisito deve ser único, específico, verificável e livre de ambiguidade.",
    parameters: {
      type: "object",
      properties: {
        section_title: {
          type: "string",
          description: "Título da seção de requisitos.",
        },
        functional_requirements: {
          type: "array",
          description:
            "Lista completa de requisitos funcionais. Cubra todas as funcionalidades — não omita requisitos por considerar óbvios.",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description:
                  "Identificador único no formato RF-N (ex: RF-1, RF-2).",
              },
              description: {
                type: "string",
                description:
                  "Descrição detalhada: comportamento esperado do sistema, regras de negócio aplicáveis, entradas e saídas envolvidas.",
              },
              priority: {
                type: "string",
                enum: ["alta", "média", "baixa"],
                description: "Prioridade do requisito para o produto.",
              },
            },
            required: ["id", "description", "priority"],
          },
        },
        non_functional_requirements: {
          type: "array",
          description:
            "Lista completa de requisitos não funcionais — performance, segurança, usabilidade, disponibilidade, manutenibilidade e conformidade.",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description:
                  "Identificador único no formato RNF-N (ex: RNF-1, RNF-2).",
              },
              description: {
                type: "string",
                description:
                  "Descrição detalhada com métricas ou critérios de aceitação quando aplicável.",
              },
              category: {
                type: "string",
                description:
                  "Categoria específica: 'performance', 'segurança', 'usabilidade', 'disponibilidade', 'conformidade' ou 'manutenibilidade'.",
              },
            },
            required: ["id", "description", "category"],
          },
        },
      },
      required: [
        "section_title",
        "functional_requirements",
        "non_functional_requirements",
      ],
    },
  },

  "sofia:requirements-module:architecture-document": {
    name: "generate_architecture_section",
    description:
      "Gera seção completa do documento de arquitetura de software. Todos os campos são obrigatórios — decisões arquiteturais devem ser justificadas e componentes descritos com responsabilidades inequívocas.",
    parameters: {
      type: "object",
      properties: {
        section_title: {
          type: "string",
          description: "Título da seção de arquitetura.",
        },
        content: {
          type: "string",
          description:
            "Descrição completa da arquitetura: visão geral, padrões adotados, estrutura de camadas, comunicação entre componentes e considerações de escalabilidade e segurança.",
        },
        components: {
          type: "array",
          description:
            "Todos os componentes da arquitetura com responsabilidades claramente delimitadas — não agrupe componentes distintos.",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Nome específico do componente.",
              },
              description: {
                type: "string",
                description:
                  "Responsabilidade detalhada: o que faz, o que não faz, com quem se comunica e quais contratos expõe.",
              },
              technology: {
                type: "string",
                description:
                  "Tecnologia ou framework específico utilizado (ex: 'Node.js 20 com Fastify', não apenas 'backend').",
              },
            },
            required: ["name", "description", "technology"],
          },
        },
        decisions: {
          type: "array",
          description:
            "Todas as decisões arquiteturais relevantes com contexto, alternativas consideradas e justificativa da escolha adotada.",
          items: {
            type: "string",
            description:
              "Decisão arquitetural com contexto, alternativas e justificativa.",
          },
        },
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
