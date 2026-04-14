export type PromptParameterType = 'string'

export interface PromptParameter {
  type: PromptParameterType
}

export interface PromptEntry {
  parameters: Record<string, PromptParameter>
  prompts: {
    header: string
    loop?: string[]
  }
}

export type PromptsMap = Record<string, PromptEntry>

export const prompts: PromptsMap = {
  "genius:classroom:assignment": {
      "parameters": {
          "context": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "Utilize este plano de aula para criar um título e uma descrição para uma atividade.\n\nPlano de Aula:\n%{context}%\n\nInstruções:\n\n1. Crie um título para a atividade com base no plano de aula.\n2. Desenvolva uma descrição detalhada da atividade, incluindo:\n   - Objetivo da atividade.\n   - Passos ou tópicos importantes.\n   - Recursos necessários.\n"
      }
  },
  "genius:classroom:lession-essentials": {
      "parameters": {
          "language": {
              "type": "string"
          },
          "text": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "indique três pontos essenciais, em %{language}%, para se aprofundar no tema %{text}%"
      }
  },
  "genius:classroom:lession-planner": {
      "parameters": {
          "instructions": {
              "type": "string"
          },
          "add_instructions": {
              "type": "string"
          },
          "topic": {
              "type": "string"
          },
          "student_level": {
              "type": "string"
          },
          "knowledge": {
              "type": "string"
          },
          "goal": {
              "type": "string"
          },
          "subject": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "Você é um instrutor amigável e útil que ajuda os professores a planejar uma aula. O professor vai lecionar a disciplina %{subject}%, sobre o tópico: %{topic}%, e os alunos correspondem ao nível %{student_level}%. De acordo com o professor, os estudantes possuem o seguinte conhecimento sobre o tópico da aula: %{knowledge}%. A aula deve ter o seguinte objetivo de aprendizagem: %{goal}%. \n\nEntão, com todas essas informações, crie um plano de aula personalizado que inclua uma variedade de técnicas e modalidades de ensino. Os tópicos do plano de aula serão enviados nas mensagens seguintes, reproduza restritamente o que for solicitado em cada mensagem. Explique por que você está escolhendo especificamente cada um. \n%{add_instructions}%\n\nNão quero estimativas de tempo, apenas o conteúdo da aula, sem separar por horas ou minutos. Procure informar o máximo de informação possível em cada solicitação.\n\nA resposta deve ser um arquivo em formado markdown, não quero texto do agente, a resposta deve ser apenas o arquivo. \n%{instructions}%",
          "loop": [
              "## Título da Aula\n*Matéria:* [insira a matéria ou disciplina, por exemplo, Matemática] \n*Tópico:* [insira o tópico aqui]",
              "## Objetivos\n- [Descreva o que os alunos deverão aprender ou alcançar no final da aula. Exemplo: Compreender conceitos básicos de álgebra.]\n- [Se houver mais de um objetivo, liste-os como itens.]",
              "## Materiais Necessários\n- [Liste todos os materiais necessários para a aula, como livros, computadores, projetores, etc.]\n- [Inclua recursos adicionais, como vídeos ou imagens.]\n",
              "## Conteúdo da Aula\n### Introdução\n- [Descreva brevemente como você apresentará o tópico da aula para envolver os alunos.]\n- [Inclua questões ou problemas introdutórios.]",
              "### Desenvolvimento\n- [Divida a seção de desenvolvimento em subseções se necessário.]\n- [Descreva as atividades ou métodos de ensino que você usará para abordar o conteúdo principal.]\n- [Inclua atividades práticas, exercícios, trabalhos em grupo, etc.]",
              "### Conclusão\n- [Descreva como você resumirá a aula e concluirá o tópico.]\n- [Inclua perguntas de reflexão ou avaliações rápidas.]",
              "## Avaliação\n- [Descreva como você avaliará o entendimento dos alunos. Pode ser uma avaliação formal ou informal.]\n- [Inclua detalhes sobre tarefas ou trabalhos que os alunos devem concluir após a aula.]\n",
              "## Observações Adicionais\n- [Inclua qualquer informação adicional, como necessidades especiais, alterações no horário, ou recomendações para leituras complementares.]\n"
          ]
      }
  },
  "genius:classroom:lession-topic": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "spec": {
              "type": "string"
          },
          "audience": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "Escreva um texto com um tom educativo e %{spec}%, para o público de %{audience}% sobre o seguinte tópico: %{context}%"
      }
  },
  "genius:classroom:related-assignments": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "quantity": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "Proponha uma questão para ser entregue baseado no seguinte plano de aula %{context}%. \nDesejo que proponha %{quantity}% questões, cada uma com título e corpo.\nPreferencialmente, é interessante as questões terem textos de interpretação de texto junto ao problema a ser resolvido."
      }
  },
  "sofia:aidesign:ideation_gdm": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\n\nVocê é um engenheiro de software encarregado de construir um novo sistema, você utilizará a metodologia AI design, utilize o contexto fornecido anteriormente como base de conhecimento. Sua tarefa é elaborar um artefato em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown seguindo os templates que vou adicionar em cada mensagem. O artefato é referente ao Canvas de Definição de Objetivos, preencha cada seção deste canvas com informações detalhadas, derivadas do Canvas de Objetivos de Projeto. Este documento deve traduzir metas estratégicas em objetivos operacionais e fornecer orientações claras para a execução técnica e o monitoramento de resultados.\n\n%{general_instructions}%",
          "loop": [
              "# Canvas de Definição de Objetivos\n\n### 1. Revisão do Objetivo Geral\n\n- **Instruções:** Reavalie e confirme o objetivo principal do projeto definido na fase de Imersão. Adapte-o se necessário, para alinhá-lo ao escopo da Ideação.\n- **Exemplo:** Confirmar ou ajustar o objetivo: \"Melhorar a eficiência no agendamento de consultas e aumentar a satisfação dos pacientes na clínica.\"",
              "### 2. Refinamento de Objetivos Específicos\n\n- **Instruções:** Refine os objetivos específicos definidos anteriormente, adicionando detalhes operacionais e ajustando a granularidade para refletir os requisitos técnicos e operacionais do projeto.\n- **Exemplo:**\n  - Reduzir o tempo médio de espera para marcação de consultas em 50%, utilizando um assistente de IA para recomendações automatizadas.\n  - Implementar lembretes automáticos para reduzir a taxa de cancelamentos de 20% para 10%.\n  - Aumentar a precisão na alocação de horários para consultas em 80%, utilizando dados históricos de agendamentos.",
              "### 3. Mapeamento de Indicadores Operacionais de Sucesso\n\n- **Instruções:** Traduza os indicadores de sucesso estratégicos para métricas operacionais que possam ser monitoradas regularmente. Inclua informações sobre ferramentas ou processos de medição.\n- **Exemplo:**\n  - Monitorar o tempo médio de espera por meio do sistema de gestão de agendamentos.\n  - Medir a taxa de cancelamentos mensalmente com base em dados do sistema de notificações.\n  - Acompanhar o número de erros na alocação de horários por meio de auditorias automáticas semanais.",
              "- **Instruções:** Reavalie e ajuste as metas quantitativas para torná-las mais específicas e adaptadas ao escopo técnico do projeto.\n- **Exemplo:**\n  - Reduzir o tempo médio de espera para marcação de consultas de 30 para 15 minutos em 6 meses, utilizando IA generativa.\n  - Implementar lembretes automáticos para atingir uma taxa de cancelamentos abaixo de 10% em 4 meses.\n  - Diminuir os erros de alocação de horários em 90% dentro de 3 meses, com validação manual inicial e transição para auditorias automatizadas.",
              "### 5. Priorização Baseada em Impacto e Viabilidade\n\n- **Instruções:** Classifique os objetivos em ordem de prioridade, utilizando critérios como impacto no negócio, viabilidade técnica, custo e tempo de implementação. Justifique a priorização com base em dados ou análises disponíveis.\n- **Exemplo:**\n  - Alta prioridade: Implementar lembretes automáticos para reduzir cancelamentos, devido ao impacto direto na experiência do cliente e na eficiência operacional.\n  - Média prioridade: Reduzir o tempo médio de espera, dependendo da integração de IA com sistemas legados.\n  - Baixa prioridade: Aumentar a precisão na alocação de horários, pois depende de melhorias nos dados existentes.",
              "### 6. Identificação de Ações e Recursos Necessários\n\n- **Instruções**: Detalhe as ações práticas necessárias para alcançar cada objetivo e os recursos que serão utilizados, como tecnologia, equipes ou orçamentos.\n- **Exemplo**:\n  - Ação: Configurar API para integração com o sistema de gestão de agendamentos.\n  - Recurso: Desenvolvedores especializados em integração de sistemas; orçamento para licenciamento de IA."
          ]
      }
  },
  "sofia:aidesign:ideation_pdm": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\n\nVocê é um engenheiro de software encarregado de construir um novo sistema, você utilizará a metodologia AI design, utilize o contexto fornecido anteriormente como base de conhecimento. Sua tarefa é elaborar um artefato em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown seguindo os templates que vou adicionar em cada mensagem. O artefato é referente ao Canvas de Design de Prompts, preencha cada seção deste canvas com informações detalhadas sobre os prompts que guiarão as interações com o assistente inteligente. Este documento ajudará a orientar e sistematizar a criação de prompts eficazes na fase de Ideação da metodologia AI Design.\n\n%{general_instructions}%",
          "loop": [
              "# Canvas de Design de Prompts\n\n### 1. Prompt Inicial\n\n- **Instruções:** Escreva o prompt inicial que será utilizado para iniciar a interação com o assistente inteligente. Este prompt deve ser claro e direto, engajando o usuário desde o início.\n- **Exemplo:** \"Olá, em que posso ajudar com o agendamento da sua consulta hoje?\"",
              "### 2. Respostas Esperadas\n\n- **Instruções:** Liste as respostas esperadas dos usuários em resposta ao prompt inicial. Considere variações e formas diferentes que os usuários podem usar para responder.\n- **Exemplo:**\n  - \"Eu gostaria de agendar uma consulta.\"\n  - \"Preciso remarcar minha consulta.\"\n  - \"Quais são os horários disponíveis para consultas?\"",
              "### 3. Ações Esperadas\n\n- **Instruções:** Defina as ações que o assistente inteligente deve tomar com base nas respostas dos usuários. Estas ações devem ser específicas e claramente relacionadas às respostas esperadas.\n- **Exemplo:**\n  - Mostrar a disponibilidade dos médicos.\n  - Confirmar a nova data e hora da consulta.\n  - Enviar um lembrete da consulta para o paciente.",
              "### 4. Feedback e Ajustes\n\n- **Instruções:** Descreva como o feedback dos usuários será coletado e utilizado para ajustar e melhorar os prompts. Inclua métodos de coleta de feedback e estratégias para implementar melhorias.\n- **Exemplo:**\n  - Coletar feedback por meio de pesquisas de satisfação após a interação.\n  - Analisar logs de interação para identificar padrões e áreas de melhoria.\n  - Realizar ajustes nos prompts com base no feedback recebido para melhorar a eficácia e a experiência do usuário."
          ]
      }
  },
  "sofia:aidesign:ideation_rpm": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\n\nVocê é um engenheiro de software encarregado de construir um novo sistema, você utilizará a metodologia AI design, utilize o contexto fornecido anteriormente como base de conhecimento. Sua tarefa é elaborar um artefato em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown seguindo os templates que vou adicionar em cada mensagem. O artefato é referente ao Canvas de Prototipagem Rápida, preencha cada seção deste canvas com informações detalhadas sobre a criação de protótipos rápidos para testar as ideias de soluções de IA generativa. Este documento ajudará a orientar e sistematizar a fase de Prototipagem na metodologia AI Design.\n%{general_instructions}%",
          "loop": [
              "# Canvas de Prototipagem Rápida\n\n### 1. Ideia de Solução\n\n- **Instruções:** Descreva a ideia de solução que será prototipada. Esta descrição deve ser clara e concisa, baseada nas ideias geradas na fase de Ideação.\n- **Exemplo:** Assistente de IA para automação do agendamento de consultas.",
              "### 2. Objetivo do Protótipo\n\n- **Instruções:** Defina o objetivo principal do protótipo. Este objetivo deve ser específico e mensurável, refletindo o que se espera alcançar com a prototipagem.\n- **Exemplo:** Validar a capacidade do assistente de IA de reduzir o tempo de espera para marcação de consultas em 50%.",
              "\n### 3. Recursos Necessários\n\n- **Instruções:** Liste os recursos necessários para a criação do protótipo. Inclua ferramentas, tecnologias, equipe, dados, e qualquer outro recurso relevante.\n- **Exemplo:**\n  - Ferramentas de desenvolvimento de IA (ex.: TensorFlow, Dialogflow)\n  - Desenvolvedores de IA e engenheiros de software\n  - Dados históricos de agendamento de consultas\n",
              "### 4. Cronograma de Desenvolvimento\n\n- **Instruções:** Estabeleça um cronograma detalhado para o desenvolvimento do protótipo. Inclua marcos importantes e prazos para cada etapa do processo.\n- **Exemplo:**\n  - Semana 1: Coleta e preparação de dados\n  - Semana 2-3: Desenvolvimento do modelo de IA\n  - Semana 4: Testes e ajustes do protótipo\n  - Semana 5: Implementação piloto",
              "### 5. Métricas de Sucesso\n\n- **Instruções:** Defina as métricas que serão utilizadas para medir o sucesso do protótipo. Estas métricas devem ser específicas, mensuráveis, alcançáveis, relevantes e com prazo definido (SMART).\n- **Exemplo:**\n  - Redução do tempo médio de espera para marcação de consultas\n  - Taxa de sucesso na confirmação de consultas\n  - Feedback positivo dos usuários"
          ]
      }
  },
  "sofia:aidesign:ideation_sim": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\n\nVocê é um engenheiro de software encarregado de construir um novo sistema, você utilizará a metodologia AI design, utilize o contexto fornecido anteriormente como base de conhecimento. Sua tarefa é elaborar um artefato em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown seguindo os templates que vou adicionar em cada mensagem. O artefato é referente ao Canvas de Ideação de Soluções, preencha cada seção deste canvas com informações detalhadas sobre as ideias de soluções inovadoras que utilizem IA generativa para resolver os problemas identificados e atingir os objetivos definidos. Este documento ajudará a orientar e sistematizar a geração de ideias na fase de Ideação da metodologia AI Design.\n\n%{general_instructions}%",
          "loop": [
              "# Canvas de Ideação de Soluções\n\n### 1. Problema a Ser Resolvido\n\n- **Instruções:** Descreva o problema específico que a solução de IA pretende resolver. Este problema deve ser claramente definido e baseado nas informações coletadas durante a fase de Imersão.\n- **Exemplo:** Longo tempo de espera para marcação de consultas na clínica.",
              "### 2. Ideias de Solução\n\n- **Instruções:** Liste as ideias de solução que foram geradas para resolver o problema identificado. Cada ideia deve ser descrita de forma clara e concisa.\n- **Exemplo:**\n  - Assistente de IA para automação do agendamento de consultas.\n  - Sistema de recomendação para horários de consulta baseados no histórico do paciente.\n  - Ferramenta de predição de cancelamentos para otimizar a ocupação.",
              "### 3. Benefícios Esperados\n\n- **Instruções:** Detalhe os benefícios esperados de cada ideia de solução. Considere aspectos como eficiência, satisfação do usuário, redução de custos, entre outros.\n- **Exemplo:**\n  - Redução no tempo de espera para marcação de consultas.\n  - Aumento na satisfação dos pacientes.\n  - Melhor utilização dos recursos médicos.",
              "### 4. Viabilidade Técnica\n\n- **Instruções:** Avalie a viabilidade técnica de cada ideia de solução. Considere fatores como recursos necessários, tecnologia disponível, e complexidade de implementação.\n- **Exemplo:**\n  - Assistente de IA: Alta viabilidade técnica com uso de APIs de IA existentes.\n  - Sistema de recomendação: Média viabilidade técnica devido à necessidade de integração com sistemas legados.\n  - Ferramenta de predição: Alta viabilidade técnica com algoritmos de machine learning disponíveis.",
              "### 5. Priorização de Soluções\n\n- **Instruções:** Classifique as ideias de solução em ordem de prioridade, levando em consideração os benefícios esperados e a viabilidade técnica. Esta priorização ajudará a determinar quais soluções devem ser desenvolvidas primeiro.\n- **Exemplo:**\n  - Alta prioridade: Assistente de IA para automação do agendamento de consultas.\n  - Média prioridade: Ferramenta de predição de cancelamentos.\n  - Baixa prioridade: Sistema de recomendação para horários de consulta."
          ]
      }
  },
  "sofia:aidesign:immersion_dim": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\n\nVocê é um engenheiro de software encarregado de construir um novo sistema, você utilizará a metodologia AI design, utilize o contexto fornecido anteriormente como base de conhecimento. Sua tarefa é elaborar um artefato em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown seguindo os templates que vou adicionar em cada mensagem. O artefato é referente ao Canvas de Identificação de Domínio, preencha cada seção deste canvas com informações detalhadas sobre o domínio específico onde a IA generativa pode agregar valor significativo. Este documento ajudará a orientar e sistematizar a fase de Imersão da metodologia AI Design.\n\n%{general_instructions}%",
          "loop": [
              "# Canvas de Identificação do Domínio\r\n\r\n### 1. Nome do Domínio\r\n\r\n- **Instruções:** Especifique o nome do domínio em que a IA generativa será aplicada. Por exemplo: \"Atendimento ao Cliente\", \"Agendamento de Consultas\", \"Análise de Crédito\".\r\n- **Exemplo:** Sistema de Agendamento de Consultas Médicas",
              "### 2. Descrição do Domínio\r\n\r\n- **Instruções:** Descreva brevemente o domínio escolhido, incluindo o contexto e os processos atuais envolvidos.\r\n- **Exemplo:** O sistema de agendamento de consultas médicas envolve a marcação de horários para pacientes em uma clínica, incluindo a gestão de disponibilidade de médicos e confirmação de consultas.",
              "### 3. Justificativa da Escolha\r\n\r\n- **Instruções:** Explique por que este domínio foi escolhido para a aplicação de IA generativa. Considere aspectos como impacto potencial, relevância para os negócios e viabilidade técnica.\r\n- **Exemplo:** A escolha do sistema de agendamento de consultas foi feita devido à alta demanda por eficiência e a necessidade de melhorar a experiência do paciente, reduzindo o tempo de espera e otimizando a alocação de recursos médicos.\r\n",
              "### 4. Problemas/Desafios Atuais\r\n\r\n- **Instruções:** Identifique os principais problemas e desafios enfrentados no domínio atualmente. Foque em questões que a IA generativa poderia ajudar a resolver.\r\n- **Exemplo:**\r\n  - Longo tempo de espera para marcação de consultas.\r\n  - Erros frequentes na alocação de horários.\r\n  - Dificuldade em ajustar horários conforme a disponibilidade dos médicos.",
              "### 5. Oportunidades de IA Generativa\r\n\r\n- **Instruções:** Liste as oportunidades específicas onde a IA generativa pode ser aplicada para agregar valor. Pense em áreas onde a automação e a inteligência podem melhorar significativamente o processo atual.\r\n- **Exemplo:**\r\n  - Automação na marcação e confirmação de consultas.\r\n  - Recomendação de horários e médicos com base no perfil do paciente.\r\n  - Predição de cancelamentos e reagendamentos para otimizar a ocupação.",
              "### 6. Benefícios Esperados\r\n\r\n- **Instruções:** Detalhe os benefícios esperados com a implementação da IA generativa no domínio escolhido. Inclua aspectos como eficiência, custo-benefício, satisfação do cliente e melhorias no processo.\r\n- **Exemplo:**\r\n  - Redução no tempo de espera para marcação de consultas.\r\n  - Aumento na satisfação dos pacientes.\r\n  - Melhor utilização dos recursos médicos.\r\n  - Redução de erros e retrabalho na gestão de agendas."
          ]
      }
  },
  "sofia:aidesign:immersion_dsm": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\n\nVocê é um engenheiro de software encarregado de construir um novo sistema, você utilizará a metodologia AI design, utilize o contexto fornecido anteriormente como base de conhecimento. Sua tarefa é elaborar um artefato em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown seguindo os templates que vou adicionar em cada mensagem. O artefato é referente ao Canvas de Mapeamento de Fontes de Dados, preencha cada seção deste canvas para mapear as fontes de dados relevantes para a solução de IA. Este documento ajudará a identificar e organizar as fontes de dados necessárias para a construção e treinamento do modelo de IA.\n\n%{general_instructions}%",
          "loop": [
              "# Canvas de Mapeamento de Fontes de Dados\r\n\r\n### 1. Nome da Fonte de Dados\r\n\r\n- **Instruções:** Identifique e nomeie cada fonte de dados relevante. Este nome deve ser claro e descritivo para facilitar a referência.\r\n- **Exemplo:** Base de Dados de Agendamentos de Consultas\r\n",
              "### 2. Descrição da Fonte de Dados\r\n\r\n- **Instruções:** Descreva brevemente a fonte de dados, incluindo o tipo de dados que ela contém e o seu propósito no contexto da solução de IA.\r\n- **Exemplo:** Base de dados contendo informações sobre agendamentos de consultas médicas, incluindo detalhes como data, hora, médico, paciente e status da consulta.\r\n",
              "### 3. Origem dos Dados\r\n\r\n- **Instruções:** Indique de onde os dados são originados. Pode incluir sistemas internos, fontes externas, dispositivos IoT, etc.\r\n- **Exemplo:** Sistema de gestão de clínicas, registros de chamadas telefônicas de agendamento.\r\n",
              "### 4. Tipo de Dados\r\n\r\n- **Instruções:** Classifique o tipo de dados contidos na fonte. Pode ser texto, numérico, temporal, categórico, etc.\r\n- **Exemplo:** Dados numéricos (número de consultas), dados textuais (nomes de pacientes e médicos), dados temporais (datas e horários).\r\n",
              "### 5. Formato dos Dados\r\n\r\n- **Instruções:** Descreva o formato dos dados na fonte. Isso pode incluir formatos de arquivos (CSV, JSON, SQL), esquemas de banco de dados, etc.\r\n- **Exemplo:** Arquivo CSV com colunas para data, hora, médico, paciente e status; banco de dados SQL com tabelas correspondentes.\r\n",
              "### 6. Frequência de Atualização\r\n\r\n- **Instruções:** Especifique a frequência com que os dados são atualizados. Pode ser em tempo real, diária, semanal, mensal, etc.\r\n- **Exemplo:** Atualização em tempo real com cada novo agendamento inserido no sistema.\r\n",
              "### 7. Qualidade dos Dados\r\n\r\n- **Instruções:** Avalie a qualidade dos dados na fonte. Considere a completude, precisão, e a presença de dados faltantes ou errôneos.\r\n- **Exemplo:** Dados geralmente completos, com algumas entradas com informações faltantes que precisam ser limpas.\r\n",
              "### 8. Métodos de Coleta\r\n\r\n- **Instruções:** Descreva como os dados são coletados. Importação de arquivos, chamadas de API, inserção manual, etc.\r\n- **Exemplo:** Importação automática via API\r\n",
              "### 9. Acesso aos Dados\r\n\r\n- **Instruções:** Descreva como os dados podem ser acessados. Isso inclui APIs, interfaces de usuário, conexões de banco de dados, etc.\r\n- **Exemplo:** Acesso via API REST fornecida pelo sistema de gestão de clínicas; exportação manual de arquivos CSV.\r\n",
              "### 10. Proprietário dos Dados\r\n\r\n- **Instruções:** Identifique o proprietário ou responsável pela fonte de dados. Pode ser uma pessoa, um departamento, ou uma organização.\r\n- **Exemplo:** Departamento de TI da Clínica\r\n",
              "### 11. Restrições de Privacidade e Segurança\r\n\r\n- **Instruções:** Identifique quaisquer restrições relacionadas à privacidade e segurança dos dados. Considere regulamentações e políticas internas.\r\n- **Exemplo:** Dados sensíveis de pacientes precisam de criptografia durante a transmissão e armazenamento, conforme regulamentações de proteção de dados pessoais.\r\n",
              "### 12. Requisitos de Integração\r\n\r\n- **Instruções:** Liste os requisitos técnicos para integrar os dados da fonte com a solução de IA. Inclua considerações sobre transformação de dados, compatibilidade e sincronização.\r\n- **Exemplo:** Necessidade de transformação de dados de CSV para JSON para integração com o modelo de IA; sincronização diária com a base de dados de agendamentos."
          ]
      }
  },
  "sofia:aidesign:immersion_pgm": {
      "parameters": {
          "context": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\n\nVocê é um engenheiro de software encarregado de construir um novo sistema, você utilizará a metodologia AI design, utilize o contexto fornecido anteriormente como base de conhecimento. Sua tarefa é elaborar um artefato em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown seguindo os templates que vou adicionar em cada mensagem. O artefato é referente ao Canvas de Objetivos de Projeto, preencha cada seção deste canvas com informações estratégicas sobre os objetivos do projeto de IA, mantendo um nível de detalhe apropriado para orientar as próximas fases do projeto. Este documento fornece uma base para a criação de metas operacionais na fase de Ideação da metodologia AI Design.\n\n%{general_instructions}%\n",
          "loop": [
              "# Canvas de Objetivos de Projeto\r\n\r\n### 1. Objetivo Estratégico Geral\r\n\r\n- **Instruções:** Descreva o objetivo principal do projeto de IA, conectando-o aos objetivos organizacionais mais amplos. Este objetivo deve ser aspiracional e refletir a visão geral do que o projeto busca alcançar em termos estratégicos.\r\n- **Exemplo:** Melhorar a eficiência operacional e a experiência do cliente no sistema de agendamento de consultas da clínica.\r\n",
              "### 2. Objetivos Estratégicos Secundários\r\n\r\n- **Instruções:** Liste os objetivos secundários que suportam o objetivo geral. Estes devem descrever como o projeto contribuirá para áreas específicas da organização.\r\n- **Exemplo:**\r\n  - Otimizar o uso de recursos humanos no setor de agendamento.\r\n  - Melhorar a qualidade dos dados usados para tomada de decisão.\r\n  - Reduzir custos associados a cancelamentos e erros administrativos.",
              "### 3. Benefícios Esperados\r\n\r\n- **Instruções:** Descreva os principais benefícios que a solução de IA deve trazer para o negócio. Foque nos impactos positivos esperados em termos de eficiência, custo-benefício e experiência do cliente.\r\n- **Exemplo:**\r\n  - Redução de custos operacionais em 20% nos próximos 12 meses.\r\n  - Aumento da satisfação do cliente em 25%, medido por NPS.\r\n  - Melhor aproveitamento das agendas médicas em 30%.",
              "### 4. Indicadores-Chave de Sucesso (KPIs)\r\n\r\n- **Instruções:** Defina os KPIs estratégicos que serão usados para medir o impacto e o sucesso do projeto de IA. Estes devem ser específicos e mensuráveis.\r\n- **Exemplo:**\r\n  - Índice de cancelamentos (redução de 20% para 10%).\r\n  - Tempo médio de atendimento reduzido em 30%.\r\n  - Taxa de utilização das agendas médicas aumentada para 90%.",
              "### 5. Requisitos Estratégicos e Restrições\r\n\r\n- **Instruções:** Identifique os requisitos estratégicos e as principais restrições que podem influenciar o alcance dos objetivos. Considere fatores como orçamento, regulamentações, e recursos disponíveis.\r\n- **Exemplo:**\r\n  - Respeitar as regulamentações de proteção de dados (LGPD).\r\n  - Orçamento limitado para implementação inicial.\r\n  - Necessidade de integração com sistemas legados.",
              "### 6. Priorização Inicial de Objetivos\r\n\r\n- **Instruções**: Identifique quais objetivos têm maior relevância estratégica e devem receber foco imediato. Baseie a priorização em impacto organizacional, viabilidade técnica e alinhamento com a visão do projeto.\r\n- **Exemplo**:\r\n  - Alta prioridade: Redução do índice de cancelamentos.\r\n  - Média prioridade: Melhoria na eficiência operacional.\r\n  - Baixa prioridade: Aumento na precisão da análise de dados em curto prazo."
          ]
      }
  },
  "sofia:aidesign:production_cmplm": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\n\nVocê é um engenheiro de software encarregado de construir um novo sistema, você utilizará a metodologia AI design, utilize o contexto fornecido anteriormente como base de conhecimento. Sua tarefa é elaborar um artefato em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown seguindo os templates que vou adicionar em cada mensagem. O artefato é referente ao Template para o Nível de Componente, preencha detalhando os componentes internos de um contêiner, mostrando como as funcionalidades são divididas e interligadas. Faça quantas forem necessárias para o projeto.\n\n%{general_instructions}%",
          "loop": [
              "## Estrutura do Template:\n1. **Título**: \"Diagrama de Componentes para [Nome do Contêiner]\"\n2. **Elementos**:\n   - Retângulos pequenos representando os componentes.\n   - Linhas indicando fluxos de dados ou dependências entre componentes.\n   - Anotações explicando funções e tecnologias específicas.\n3. **Legenda**: Explica cores ou símbolos usados para diferenciar tipos de componentes (ex.: processamento, dados, APIs).\n\n## Exemplo Prático:\n- **Serviço de IA**:\n  - **Gerador de Prompts**:\n    - Função: Criar mensagens baseadas nas intenções do usuário.\n    - Tecnologia: LangChain.\n  - **Recomendador de Horários**:\n    - Função: Sugerir horários ideais.\n    - Tecnologia: TensorFlow.\n  - **Validador de Consultas**:\n    - Função: Validar horários disponíveis.\n    - Tecnologia: Python."
          ]
      }
  },
  "sofia:aidesign:production_cntlm": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\n\nVocê é um engenheiro de software encarregado de construir um novo sistema, você utilizará a metodologia AI design, utilize o contexto fornecido anteriormente como base de conhecimento. Sua tarefa é elaborar um artefato em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown seguindo os templates que vou adicionar em cada mensagem. O artefato é referente ao Template para o Nível de Contêiner, preencha detalhando os os componentes principais do sistema, como serviços de backend, bancos de dados, interfaces de usuário e APIs. Faça quantas forem necessárias para o projeto.\n\n%{general_instructions}%",
          "loop": [
              "## Estrutura do Template:\n1. **Título**: \"Diagrama de Contêiner para [Nome do Assistente]\"\n2. **Elementos**:\n   - Retângulos representando contêineres (Frontend, Backend, Banco de Dados, Serviços de IA).\n   - Linhas indicando interações entre contêineres.\n   - Anotações nos contêineres com tecnologias usadas.\n3. **Legenda** (opcional): Diferencia tipos de contêineres (por exemplo, armazenamento, lógica de negócios, interface).\n\n## Exemplo Prático:\n- **Frontend (Chatbot)**:\n  - Tecnologia: React + WebSocket.\n  - Função: Interagir com os usuários.\n- **Serviço de IA**:\n  - Tecnologia: FastAPI + TensorFlow.\n  - Função: Gerar recomendações e processar consultas.\n- **Banco de Dados**:\n  - Tecnologia: PostgreSQL.\n  - Função: Armazenar consultas e informações de pacientes."
          ]
      }
  },
  "sofia:aidesign:production_ctxlm": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\n\nVocê é um engenheiro de software encarregado de construir um novo sistema, você utilizará a metodologia AI design, utilize o contexto fornecido anteriormente como base de conhecimento. Sua tarefa é elaborar um artefato em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown seguindo os templates que vou adicionar em cada mensagem. O artefato é referente ao Template para o Nível de Contexto, preencha mostrando os atores externos (usuários, sistemas, dispositivos) e sua interação com o sistema de IA. Ideal para comunicar o propósito geral e o papel do assistente. Faça quantas forem necessárias para o projeto.\n\n%{general_instructions}%",
          "loop": [
              "## Estrutura do Template:\n1. **Título**: \"Diagrama de Contexto para [Nome do Assistente]\"\n2. **Elementos**:\n   - Retângulo central representando o sistema principal (Assistente Inteligente).\n   - Retângulos menores representando os atores externos (usuários, sistemas).\n   - Linhas conectando os atores ao sistema, com anotações explicando o tipo de interação.\n3. **Legenda** (opcional): Para indicar cores ou símbolos que diferenciam tipos de atores ou interações.\n\n## Exemplo Prático:\n- **Assistente Inteligente**:\n  - **Usuários**: Pacientes, Recepcionistas.\n  - **Sistemas**: CRM, Banco de Dados de Consultas.\n  - **Interações**:\n    - Paciente → Assistente: \"Quero agendar uma consulta.\"\n    - Assistente → CRM: \"Buscar dados do paciente.\"\n    - Assistente → Banco de Dados: \"Atualizar consulta agendada.\""
          ]
      }
  },
  "sofia:aidesign:production_dlm": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\n\nVocê é um engenheiro de software encarregado de construir um novo sistema, você utilizará a metodologia AI design, utilize o contexto fornecido anteriormente como base de conhecimento. Sua tarefa é elaborar um artefato em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown seguindo os templates que vou adicionar em cada mensagem. O artefato é referente ao Canvas de Entrega e Lançamento, O Canvas de Entrega e Lançamento é uma ferramenta para planejar, organizar e executar a entrega e o lançamento do assistente inteligente em um ambiente de produção. Ele garante que a transição do sistema para operação seja feita de maneira estruturada, minimizando riscos e maximizando o impacto positivo para os stakeholders. Preencha cada seção do canvas com informações detalhadas sobre o planejamento, as ações e os recursos necessários para a entrega e o lançamento do sistema. O objetivo é assegurar um lançamento bem-sucedido e eficiente.\n\n%{general_instructions}%",
          "loop": [
              "# Canvas de Entrega e Lançamento\n\n### 1. Objetivo do Lançamento\n- **Instruções**: Descreva o propósito principal do lançamento, vinculando-o aos benefícios esperados para os usuários e o negócio.\n- **Exemplo**: \"Disponibilizar o assistente inteligente para automatizar o agendamento de consultas, melhorando a experiência dos pacientes e reduzindo custos operacionais.\"\n",
              "### 2. Escopo do Lançamento\n- **Instruções**: Defina o que será incluído no lançamento inicial. Especifique funcionalidades, integrações e restrições.\n- **Exemplo**:\n  - Funcionalidades:\n    - Agendamento automatizado.\n    - Recomendação de horários.\n  - Integrações:\n    - CRM.\n    - Sistema de notificações.\n  - Restrições:\n    - Apenas consultas médicas (outras categorias serão incluídas em versões futuras).\n",
              "### 3. Cronograma\n- **Instruções**: Estabeleça um cronograma detalhado para as etapas do lançamento.\n- **Exemplo**:\n  - **Fase 1 (1ª semana)**: Implantação no ambiente de produção.\n  - **Fase 2 (2ª semana)**: Treinamento da equipe de suporte.\n  - **Fase 3 (3ª semana)**: Monitoramento intensivo e coleta de feedback inicial.\n",
              "### 4. Estratégia de Lançamento\n- **Instruções**: Escolha uma abordagem para o lançamento (Big Bang, Gradual, etc.) e justifique sua escolha.\n- **Exemplo**:\n  - **Abordagem**: Lançamento gradual.\n  - **Justificativa**: Permite monitorar o impacto em grupos menores antes de expandir para todos os usuários.\n",
              "### 5. Comunicação Interna e Externa\n- **Instruções**: Detalhe como a equipe será informada sobre o lançamento e como os usuários finais serão introduzidos ao sistema.\n- **Exemplo**:\n  - **Interna**:\n    - Reuniões de alinhamento com as equipes.\n    - Materiais de treinamento.\n  - **Externa**:\n    - E-mail para pacientes explicando o novo sistema.\n    - Vídeo tutorial integrado ao chatbot.\n",
              "### 6. Plano de Monitoramento Pós-Lançamento\n- **Instruções**: Estabeleça estratégias para monitorar o desempenho do sistema após o lançamento.\n- **Exemplo**:\n  - Monitoramento de logs para identificar falhas críticas.\n  - Relatórios semanais de desempenho (tempo de resposta, taxa de sucesso).\n  - Pesquisa de satisfação com usuários nas primeiras duas semanas.\n",
              "### 7. Planos de Contingência\n- **Instruções**: Identifique possíveis riscos e as ações de contingência planejadas.\n- **Exemplo**:\n  - **Risco**: Falhas na integração com o banco de dados.\n  - **Plano**: Reverter para o sistema anterior e corrigir a integração.\n",
              "### 8. Recursos Necessários\n- **Instruções**: Liste os recursos humanos, técnicos e financeiros necessários para o lançamento.\n- **Exemplo**:\n  - **Humanos**: Engenheiros de suporte, equipe de TI.\n  - **Técnicos**: Servidores adicionais para lidar com aumento de tráfego.\n  - **Financeiros**: Orçamento para campanhas de divulgação.\n",
              "### 9. Métricas de Sucesso\n- **Instruções**: Defina as métricas que indicarão o sucesso do lançamento.\n- **Exemplo**:\n  - Taxa de adoção pelos usuários ≥ 80% na primeira semana.\n  - Tempo médio de resposta ≤ 2 segundos.\n  - Satisfação dos usuários ≥ 90% na pesquisa inicial.\n",
              "### 10. Feedback e Iterações\n- **Instruções**: Planeje como o feedback dos usuários e da equipe será coletado e utilizado para melhorias.\n- **Exemplo**:\n  - Coleta de feedback via chatbot.\n  - Sessões de revisão semanais com a equipe de suporte.\n  - Atualizações mensais baseadas em sugestões e problemas relatados.\n"
          ]
      }
  },
  "sofia:aidesign:production_mttm": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\n\nVocê é um engenheiro de software encarregado de construir um novo sistema, você utilizará a metodologia AI design, utilize o contexto fornecido anteriormente como base de conhecimento. Sua tarefa é elaborar um artefato em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown seguindo os templates que vou adicionar em cada mensagem. O artefato é referente ao Canvas de Treinamento e Ajuste do Modelo, O Canvas de Treinamento e Ajuste do Modelo organiza e documenta o processo de treinamento, ajuste fino (fine-tuning) e avaliação do modelo de IA. Ele ajuda a garantir que o modelo seja otimizado para os objetivos específicos do projeto, utilizando dados de alta qualidade e métricas claras para monitorar o desempenho. Preencha cada seção do canvas com informações detalhadas sobre o processo de treinamento e ajuste do modelo. O foco deve estar em garantir a qualidade, eficiência e alinhamento do modelo com os objetivos operacionais e estratégicos definidos nas fases anteriores.\n\n%{general_instructions}%",
          "loop": [
              "# Canvas de Treinamento e Ajuste do Modelo\n\n### 1. Objetivo do Modelo\n- **Instruções**: Descreva o propósito principal do modelo de IA, conectando-o aos objetivos do projeto.\n- **Exemplo**: \"Prever horários ideais para consultas médicas com base no histórico de pacientes e disponibilidade médica.\"\n",
              "### 2. Dados para Treinamento\n- **Instruções**: Identifique e descreva os conjuntos de dados utilizados para o treinamento do modelo.\n  - Fonte dos dados (internos, externos).\n  - Tipo de dados (estruturados, não estruturados).\n  - Volume de dados.\n  - Estratégias de pré-processamento aplicadas.\n- **Exemplo**:\n  - **Fonte**: Banco de Dados de Consultas.\n  - **Tipo**: Dados estruturados (tabelas SQL com horários, médicos, e consultas).\n  - **Volume**: 500 mil registros.\n  - **Pré-processamento**: Remoção de duplicatas, normalização de horários.\n",
              "### 3. Estratégia de Treinamento\n- **Instruções**: Detalhe como o modelo será treinado.\n  - Algoritmo ou arquitetura utilizada (Transformer, LSTM, etc.).\n  - Configuração do treinamento (épocas, taxa de aprendizado, etc.).\n  - Ferramentas e frameworks.\n- **Exemplo**:\n  - **Algoritmo**: Transformer-based recommendation model.\n  - **Configuração**: 10 épocas, taxa de aprendizado 0.001.\n  - **Frameworks**: TensorFlow, Hugging Face.\n",
              "### 4. Ajuste Fino (Fine-Tuning)\n- **Instruções**: Explique como o modelo será ajustado para o domínio específico do projeto.\n  - Fonte de dados para ajuste fino.\n  - Estratégias de especialização (adicionar pesos, congelar camadas, etc.).\n- **Exemplo**:\n  - **Dados de Ajuste**: Histórico de agendamentos para pacientes crônicos.\n  - **Estratégia**: Congelar camadas iniciais, ajustar as últimas camadas.\n",
              "### 5. Métricas de Avaliação\n- **Instruções**: Defina as métricas para avaliar o desempenho do modelo e sua adequação aos objetivos do projeto.\n- **Exemplo**:\n  - **Métricas**:\n    - Precisão: ≥ 90%.\n    - Recall: ≥ 85%.\n    - F1-Score: ≥ 88%.\n  - **Ferramenta de Avaliação**: Scikit-learn.\n",
              "### 6. Ciclo de Validação\n- **Instruções**: Detalhe como será feita a validação do modelo.\n  - Técnicas de validação (cross-validation, hold-out, etc.).\n  - Divisão dos dados (treinamento, validação, teste).\n- **Exemplo**:\n  - **Técnica**: Validação cruzada 5-fold.\n  - **Divisão**: 70% treinamento, 15% validação, 15% teste.\n",
              "### 7. Ajustes Necessários\n- **Instruções**: Documente os ajustes que serão feitos no modelo com base nos resultados da validação.\n- **Exemplo**:\n  - \"Aumentar o número de épocas para melhorar a precisão.\"\n  - \"Reduzir overfitting utilizando dropout em camadas intermediárias.\"\n",
              "### 8. Registro de Iterações\n- **Instruções**: Registre as iterações do treinamento e ajuste do modelo, incluindo parâmetros modificados e resultados obtidos.\n- **Exemplo**:\n  - **Iteração 1**: 5 épocas, taxa de aprendizado 0.001 → Precisão 85%.\n  - **Iteração 2**: 10 épocas, taxa de aprendizado 0.0005 → Precisão 90%.\n",
              "### 9. Ferramentas e Recursos\n- **Instruções**: Liste as ferramentas, frameworks e recursos necessários para o treinamento.\n- **Exemplo**:\n  - TensorFlow, GPU Nvidia RTX 3080, dataset armazenado no Amazon S3.\n",
              "### 10. Time e Responsabilidades\n- **Instruções**: Identifique os membros da equipe responsáveis por cada etapa do treinamento.\n- **Exemplo**:\n  - Cientista de Dados: Configuração do modelo.\n  - Engenheiro de Dados: Pré-processamento dos dados.\n  - Arquiteto de IA: Ajuste fino e avaliação.\n"
          ]
      }
  },
  "sofia:aidesign:validation_dpm": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\n\nVocê é um engenheiro de software encarregado de construir um novo sistema, você utilizará a metodologia AI design, utilize o contexto fornecido anteriormente como base de conhecimento. Sua tarefa é elaborar um artefato em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown seguindo os templates que vou adicionar em cada mensagem. O artefato é referente ao Canvas de Planejamento de Diversificação, O Canvas de Planejamento de Diversificação organiza o processo de expansão funcional do assistente inteligente, detalhando novas funcionalidades, casos de uso, benefícios esperados e requisitos técnicos. Ele garante que a diversificação seja planejada de forma estruturada, alinhada aos objetivos do projeto e às necessidades dos usuários. Preencha cada seção com informações detalhadas sobre as novas funcionalidades ou casos de uso a serem integrados ao assistente. O objetivo é garantir que a diversificação melhore o impacto do sistema sem comprometer sua estabilidade.\n\n%{general_instructions}%",
          "loop": [
              "# Canvas de Planejamento de Diversificação\n\n### 1. Objetivo da Diversificação\n- **Instruções**: Descreva o propósito principal da diversificação, vinculando-o aos objetivos estratégicos do projeto.\n- **Exemplo**: \"Expandir o assistente para incluir agendamento de exames, complementando a funcionalidade atual de consultas médicas.\"",
              "### 2. Novas Funcionalidades Planejadas\n- **Instruções**: Liste as novas funcionalidades ou casos de uso que serão incorporados.\n- **Exemplo**:\n  - Agendamento de exames laboratoriais.\n  - Consulta de resultados de exames via chatbot.\n  - Sugestões de médicos especialistas baseadas no histórico do paciente.",
              "### 3. Benefícios Esperados\n- **Instruções**: Detalhe os benefícios que a diversificação trará para os usuários e o negócio.\n- **Exemplo**:\n  - Maior conveniência para os pacientes, ao centralizar serviços médicos em um único assistente.\n  - Redução do volume de chamadas telefônicas para agendamento de exames.\n  - Aumento da satisfação do cliente em 20%.",
              "### 4. Requisitos Técnicos\n- **Instruções**: Liste os requisitos necessários para implementar as novas funcionalidades.\n- **Exemplo**:\n  - Integração com o sistema de exames laboratoriais via API REST.\n  - Armazenamento seguro de dados sensíveis de exames (LGPD/GDPR).\n  - Ajustes no fluxo de interação do chatbot.",
              "### 5. Priorização de Funcionalidades\n- **Instruções**: Classifique as funcionalidades planejadas em ordem de prioridade, com base em impacto, viabilidade técnica e tempo de implementação.\n- **Exemplo**:\n  - Alta prioridade: Agendamento de exames laboratoriais.\n  - Média prioridade: Consulta de resultados de exames via chatbot.\n  - Baixa prioridade: Sugestões de médicos especialistas.",
              "### 6. Cronograma de Implementação\n- **Instruções**: Defina um cronograma detalhado para a implementação das funcionalidades.\n- **Exemplo**:\n  - **Mês 1**: Desenvolvimento e testes do fluxo de agendamento de exames.\n  - **Mês 2**: Integração com o sistema de exames laboratoriais.\n  - **Mês 3**: Testes de usuário e lançamento da funcionalidade.",
              "### 7. Riscos e Mitigação\n- **Instruções**: Identifique os principais riscos associados à diversificação e como serão mitigados.\n- **Exemplo**:\n  - **Risco**: Demora na integração com sistemas de exames laboratoriais.\n  - **Mitigação**: Trabalhar com fornecedores para definir prazos claros e configurar um ambiente de teste antecipadamente.",
              "### 8. Métricas de Sucesso\n- **Instruções**: Defina como será medido o sucesso da diversificação.\n- **Exemplo**:\n  - Número de exames agendados via chatbot ≥ 1.000/mês.\n  - Taxa de erro na consulta de resultados de exames ≤ 2%.\n  - Satisfação dos usuários ≥ 85% na nova funcionalidade.",
              "### 9. Recursos Necessários\n- **Instruções**: Liste os recursos humanos, técnicos e financeiros necessários.\n- **Exemplo**:\n  - **Humanos**: Desenvolvedores, analistas de negócios.\n  - **Técnicos**: Infraestrutura de servidores para lidar com novos fluxos.\n  - **Financeiros**: R$ 10.000 para integração com APIs externas.",
              "### 10. Plano de Feedback\n- **Instruções**: Detalhe como o feedback dos usuários será coletado e utilizado para melhorar as novas funcionalidades.\n- **Exemplo**:\n  - Pesquisas de satisfação no chatbot.\n  - Análise de logs para identificar falhas ou fluxos problemáticos.\n  - Revisões mensais com a equipe de desenvolvimento."
          ]
      }
  },
  "sofia:aidesign:validation_gdep": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\n\nVocê é um engenheiro de software encarregado de construir um novo sistema, você utilizará a metodologia AI design, utilize o contexto fornecido anteriormente como base de conhecimento. Sua tarefa é elaborar um artefato em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown seguindo os templates que vou adicionar em cada mensagem. O artefato é referente ao Canvas de Planejamento de Expansão Geográfica ou de Domínio. O Canvas de Planejamento de Expansão Geográfica ou de Domínio ajuda a planejar como o assistente inteligente será adaptado e implementado em novos mercados, contextos geográficos ou domínios de aplicação. Ele garante que a expansão seja feita de forma estratégica, considerando diferenças culturais, legais e técnicas. Preencha cada seção com informações detalhadas sobre o planejamento de expansão do assistente. O objetivo é garantir que o processo seja eficiente e alinhado às especificidades do novo mercado ou domínio.\n\n%{general_instructions}%",
          "loop": [
              "# Canvas de Planejamento de Expansão Geográfica ou de Domínio\n\n### 1. Objetivo da Expansão\n- **Instruções**: Descreva o propósito principal da expansão, vinculado aos objetivos estratégicos.\n- **Exemplo**: \"Expandir o assistente para novos mercados regionais, permitindo agendamentos em clínicas em toda a América Latina.\"",
              "### 2. Novos Mercados ou Domínios\n- **Instruções**: Identifique os mercados ou domínios específicos para onde o assistente será expandido.\n- **Exemplo**:\n  - Geográfico: Brasil, México, Argentina.\n  - Domínio: Agendamento de consultas odontológicas.",
              "### 3. Ajustes Necessários\n- **Instruções**: Liste os ajustes que serão necessários para adaptar o assistente ao novo mercado ou domínio.\n- **Exemplo**:\n  - Idioma: Tradução para espanhol e português.\n  - Moeda: Adaptação para moedas locais.\n  - Cultura: Ajustes no tom de linguagem para refletir normas culturais.\n  - Regulamentação: Conformidade com LGPD, GDPR e leis locais.",
              "### 4. Estratégia de Implementação\n- **Instruções**: Planeje a abordagem para a expansão (piloto, lançamento completo, etc.).\n- **Exemplo**:\n  - **Fase 1**: Lançar piloto em 5 clínicas no Brasil.\n  - **Fase 2**: Expandir para 50 clínicas após o piloto.\n  - **Fase 3**: Iniciar implementação no México e na Argentina.",
              "### 5. Benefícios Esperados\n- **Instruções**: Liste os benefícios esperados com a expansão.\n- **Exemplo**:\n  - Aumento da base de usuários em 30%.\n  - Expansão da receita em 20% no primeiro ano.\n  - Maior reconhecimento da marca em novos mercados.",
              "### 6. Riscos e Mitigação\n- **Instruções**: Identifique os principais riscos da expansão e as estratégias para mitigá-los.\n- **Exemplo**:\n  - **Risco**: Baixa adoção em novos mercados devido a diferenças culturais.\n  - **Mitigação**: Conduzir pesquisa de mercado antes da implementação.",
              "### 7. Requisitos Técnicos\n- **Instruções**: Liste os requisitos técnicos específicos para a expansão.\n- **Exemplo**:\n  - Integração com sistemas regionais de gestão de clínicas.\n  - Servidores locais para conformidade com regulamentações de dados.\n  - Capacidade de suportar múltiplos idiomas simultaneamente.",
              "### 8. Cronograma\n- **Instruções**: Defina um cronograma detalhado para a expansão.\n- **Exemplo**:\n  - **Mês 1-2**: Pesquisa e planejamento.\n  - **Mês 3-4**: Desenvolvimento e ajustes técnicos.\n  - **Mês 5**: Lançamento piloto.\n  - **Mês 6+**: Expansão completa.",
              "### 9. Métricas de Sucesso\n- **Instruções**: Defina métricas para avaliar o sucesso da expansão.\n- **Exemplo**:\n  - Número de usuários ativos nos novos mercados ≥ 10.000 em 3 meses.\n  - Taxa de adoção inicial ≥ 80% nas clínicas participantes.\n  - Retorno sobre investimento (ROI) ≥ 15% no primeiro ano.",
              "### 10. Comunicação e Treinamento\n- **Instruções**: Detalhe como o processo de comunicação e treinamento será conduzido nos novos mercados ou domínios.\n- **Exemplo**:\n  - Sessões de treinamento para funcionários das clínicas.\n  - Materiais de onboarding em múltiplos idiomas.\n  - Campanha de divulgação personalizada para cada região."
          ]
      }
  },
  "sofia:aidesign:validation_sim": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\n\nVocê é um engenheiro de software encarregado de construir um novo sistema, você utilizará a metodologia AI design, utilize o contexto fornecido anteriormente como base de conhecimento. Sua tarefa é elaborar um artefato em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown seguindo os templates que vou adicionar em cada mensagem. O artefato é referente ao Canvas de Métricas de Escala e Impacto. O Canvas de Métricas de Escala e Impacto organiza e documenta as métricas essenciais para monitorar a operação do assistente inteligente em escala, avaliando seu desempenho, uso e impacto no negócio. Ele ajuda a garantir que o sistema mantenha qualidade e eficiência à medida que cresce. Preencha cada seção com informações detalhadas sobre as métricas e ferramentas de monitoramento utilizadas para avaliar o impacto do assistente. O objetivo é assegurar que as metas estratégicas sejam atingidas e que o sistema esteja preparado para melhorias contínuas.\n\n%{general_instructions}%",
          "loop": [
              "# Canvas de Métricas de Escala e Impacto\n\n### 1. Objetivo do Monitoramento\n- **Instruções**: Descreva o propósito principal do monitoramento e como ele está relacionado aos objetivos do projeto.\n- **Exemplo**: \"Monitorar o impacto do assistente no tempo de resposta, satisfação do usuário e eficiência operacional.\"\n",
              "### 2. Métricas de Uso\n- **Instruções**: Liste as métricas relacionadas ao uso do assistente.\n- **Exemplo**:\n  - Número de interações diárias.\n  - Número de usuários ativos por semana/mês.\n  - Taxa de adoção do assistente em relação ao método tradicional.",
              "### 3. Métricas de Desempenho\n- **Instruções**: Liste as métricas que avaliam a eficiência técnica do assistente.\n- **Exemplo**:\n  - Tempo médio de resposta.\n  - Taxa de erros ou falhas durante as interações.\n  - Latência nas consultas ao banco de dados.",
              "### 4. Métricas de Impacto no Negócio\n- **Instruções**: Liste as métricas que mostram o impacto direto no negócio.\n- **Exemplo**:\n  - Redução de custos operacionais (ex.: menos chamadas telefônicas).\n  - Aumento de receita por meio de novos agendamentos.\n  - Taxa de retenção de usuários.\n",
              "### 5. Métricas de Satisfação do Usuário\n- **Instruções**: Liste as métricas que avaliam a experiência e a satisfação dos usuários.\n- **Exemplo**:\n  - Pontuação de Satisfação do Cliente (CSAT).\n  - Taxa de retorno (usuários que utilizam o assistente repetidamente).\n  - Feedback positivo/negativo por interação.",
              "### 6. Ferramentas de Monitoramento\n- **Instruções**: Liste as ferramentas que serão usadas para coletar e analisar as métricas.\n- **Exemplo**:\n  - **Uso e Desempenho**: Google Analytics, Datadog.\n  - **Satisfação**: Surveys no chatbot, Hotjar.\n  - **Impacto no Negócio**: BI Tools (Power BI, Tableau).",
              "### 7. Benchmarks\n- **Instruções**: Defina valores de referência para cada métrica, baseados em dados históricos ou melhores práticas.\n- **Exemplo**:\n  - Tempo médio de resposta ideal: ≤ 2 segundos.\n  - Satisfação do cliente ideal: ≥ 90%.\n  - Taxa de adoção ideal: ≥ 80% em 3 meses.\n",
              "### 8. Acompanhamento de Tendências\n- **Instruções**: Descreva como as tendências serão monitoradas e analisadas.\n- **Exemplo**:\n  - Relatórios semanais de uso e desempenho.\n  - Comparação de métricas atuais com benchmarks históricos.\n  - Identificação de sazonalidades ou padrões emergentes.",
              "### 9. Ações Baseadas nas Métricas\n- **Instruções**: Planeje ações corretivas ou melhorias com base nos dados coletados.\n- **Exemplo**:\n  - Otimizar consultas SQL se a latência exceder 3 segundos.\n  - Revisar o design do chatbot se a taxa de feedback negativo superar 5%.\n  - Lançar campanhas de divulgação para aumentar a taxa de adoção.",
              "### 10. Relatórios e Compartilhamento\n- **Instruções**: Planeje como os relatórios serão gerados e compartilhados com os stakeholders.\n- **Exemplo**:\n  - Relatórios mensais enviados para a equipe de produto.\n  - Painéis interativos no Power BI para consultas em tempo real.\n  - Reuniões trimestrais para revisão estratégica das métricas."
          ]
      }
  },
  "sofia:requirements-module:architecture-document": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}% \\nVocê é um engenheiro de software encarregado de desenvolver um novo sistema. Sua tarefa é elaborar um Documento de Arquitetura de Software com base no contexto fornecido acima em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown seguindo os templates que vou adicionar em cada mensagem. %{general_instructions}%"
      }
  },
  "sofia:requirements-module:expand-prompt": {
      "parameters": {
          "context": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "Complemente e melhore e devolva em formato markdown a seguinte descrição utilizando o contexto do mercado e desenvolvendo melhor itens como funcionalidades, fluxos e sugestões. Pelo menos 10 funcionalidades devem ser desenvolvidas: %{context}%"
      }
  },
  "sofia:requirements-module:project-scope": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}% \\nVocê é um engenheiro de software encarregado de desenvolver um novo sistema. Sua tarefa é elaborar um Documento de Escopo do Projeto com base no contexto fornecido acima em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown. %{general_instructions}%",
          "loop": [
              "1. Descrição do Projeto:\n[...]",
              "2. Declaração do Escopo:\n[...]",
              "3. Critérios de Aceitação:\n[...]",
              "4. Limites do Projeto: \n[...]",
              "5. Entregas: \n[em tabelas]\n[...]",
              "6. Restrições e Assunções:\n[...]",
              "7. Estrutura Analítica do Projeto (EAP):\n[...]"
          ]
      }
  },
  "sofia:requirements-module:requirement-document": {
      "parameters": {
          "general_instructions": {
              "type": "string"
          },
          "context": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}% \nVocê é um engenheiro de software encarregado de desenvolver um novo sistema. Sua tarefa é elaborar o documento de requisitos funcionais e não funcionais para este sistema. Não quero nada ilustrativo, quero o documento para um projeto real. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown preenchendo o template enviado em cada mensagem. \n\n- [...] significa listar e/ou preencher com o máximo de informações possível.  \n- informações dentro de colchetes [ ] são exemplos.\n- informações dentro de chaves { } significa a descrição do que deve ser escrito.\n\n %{general_instructions}%",
          "loop": [
              "# {título do documento}\n\n## Nome do Projeto:\n## Data:\n## Versão:\n## Responsáveis:",
              "## Descrição Geral\n\n## Objetivo do Produto / Sistema\n{Descreva o propósito e os objetivos gerais do software a ser desenvolvido, alinhado com as metas de negócios de alto nível.}\n[...]\n",
              "## Usuário\n{Descreva a quem o produto/sistema se destina a servir, quais são os usuários que irão utilizar e operar o sistema, e suas funções.}\n[...]",
              "### Perfis de Usuário\n[1. **Gerente de Vendas**: Responsável por monitorar e analisar o desempenho das vendas.]\n[2. **Representante de Atendimento ao Cliente**: Utiliza o sistema para registrar e acompanhar pedidos de clientes.]\n[3. **Cliente Final**: Faz pedidos através do portal online e acompanha o status de seus pedidos.]\n\n[...]",
              "## Funções\n{Liste as principais funções que o produto deve realizar. Considere a inclusão de casos de uso ou user stories para descrever como essas funções serão utilizadas no contexto do sistema.}\n[...]",
              "## Restrições\n{Liste todas as restrições que impactam o desenvolvimento do software, como restrições de hardware, software, regulamentações, etc.}\n[...]\n",
              "## Dependências\n{Descreva todas as suposições feitas durante a definição dos requisitos e as dependências externas que podem impactar o projeto. Inclua riscos associados a cada dependência e como planeja-se mitigar esses riscos.}\n[...]",
              "## Requisitos Funcionais\n{Liste detalhadamente cada requisito funcional que o software deve atender. Especifique entradas, comportamentos e saídas esperados. Utilize diagramas, fluxogramas e mockups para ilustração quando aplicável.}\n\n[### RF01 - Cadastro de Pedido]\n[**ID**: RF01]\n[**Usuário**: Representante de Atendimento ao Cliente]\n[**Descrição**: O sistema deve permitir que o representante cadastre novos pedidos de clientes.]\n[**Entrada**: Dados do cliente, itens do pedido, quantidade, endereço de entrega.]\n[**Processo**: ]\n[  1. Validar dados do cliente.]\n[  2. Verificar disponibilidade de estoque.]\n[  3. Registrar pedido no sistema.]\n[  4. Enviar confirmação ao cliente.]\n[**Saída**: Pedido cadastrado no sistema, confirmação enviada ao cliente.]\n[**Prioridade**: Alta]\n[**Dependências**: Requisito RF02 (Validação de Estoque)]\n\n[...]",
              "## Requisitos Não Funcionais\n\n### Performance\n{Especifique tempos de resposta, capacidade, disponibilidade, etc.}\n[...]",
              "### Usabilidade\n{Descreva os requisitos de usabilidade, como facilidade de uso, acessibilidade, etc.}\n[...]",
              "### Segurança\n{Descreva requisitos de autenticação, criptografia, controle de acesso ou quaisquer módulos de segurança necessários para seu desenvolvimento. Inclua quaisquer regulamentos de privacidade e proteção de dados que devam ser respeitados.}\n[...]",
              "### Manutenabilidade\n{Descreva os requisitos de manutenibilidade, como modularidade, facilidade de correção de erros, e como a integração contínua deve ser usada para implantar recursos e correções de bugs rapidamente.}\n[...]",
              "### Escalabilidade\nQuais são as cargas de trabalho mais altas sob as quais seu software ainda terá o desempenho esperado dentro da arquitetura e infraestrutura proposta.}\n[...]",
              "## Requisitos de Interface\n\n### Interface de Usuário\n{Descreva os requisitos para a interface de usuário, incluindo wireframes, protótipos, etc.}\n[...]",
              "### Interface de Software\n{Descreva de forma detalhada os requisitos de interface com outros sistemas de software, APIs, integrações, etc.}\n[...]",
              "### Interface de Comunicação\n{Descreva os requisitos de comunicação, como protocolos de rede, formatos de dados, etc.}\n[...]",
              "## Gerenciamento dos Requisitos\n\n### Identificação de Requisitos\n{Descreva o processo utilizado para identificar os requisitos do software, incluindo técnicas como entrevistas, questionários, workshops, análise de documentos, etc.}\n[...]",
              "### Priorização dos Requisitos\n{Listagem com data, sprint do qual o requisito foi priorizado, stakeholder responsável pela priorização dos requisitos e justificativa.}\n\n[| ID do Requisito | Número da Sprint | Stakeholder | Justificativa da Priorização |\n|-----------------|------------------|-------------|------------------------------|\n|                 |                  |             |                              |\n|                 |                  |             |                              |]\n\n[...]"
          ]
      }
  },
  "sofia:starter:epic-map": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\n\nDescrição de telas de um aplicativo utilizando o seguinte contexto fornecido abaixo nas próximas mensagens.\nAs telas, critérios de aceite e outros itens devem ser as mais detalhadas e sua quantidade devem estar alinhadas e fazer sentido de acordo com as funcionalidades e contexto informado.\n\n%{general_instructions}%"
      }
  },
  "sofia:starter:expand-prompt": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "Complemente e melhore e devolva em formato markdown a seguinte descrição utilizando o contexto do mercado e desenvolvendo melhor itens como funcionalidades, fluxos e sugestões. Pelo menos 10 funcionalidades devem ser desenvolvidas: %{context}%\n\n%{general_instructions}%"
      }
  },
  "sofia:starter:map-bdd": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\nImagine que você é um arquiteto de software, usando o contexto do JSON acima, preciso dos cenários de um BDD estruturado em Markdown com o máximo de detalhes que conseguir mapear utilizando o template da mensagem a seguir. \n%{general_instructions}%",
          "loop": [
              "Funcionalidade: <Nome da funcionalidade>\n- Para <benefício>\n- Como <papel>\n- Eu quero <comportamento>",
              "@<tag>\n<Número do Cenário> - Cenário: <Nome do cenário>\n- Dado <condição>\n- Quando <ação>\n- Então <resultado esperado>"
          ]
      }
  },
  "sofia:starter:project-architecture": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\nVocê é um engenheiro de software encarregado de desenvolver um novo sistema. Sua tarefa é elaborar um Documento de Arquitetura de Software com base no contexto fornecido acima em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown seguindo os templates que vou adicionar em cada mensagem. %{general_instructions}%",
          "loop": [
              "1. Introdução\n[Descrição da aplicação e propósito do documento]",
              "2. Visão Geral da Arquitetura\n[Explicação da arquitetura geral do sistema]",
              "3. Diagrama de Componentes\n[Explicações sobre os componentes do sistema e suas interações]",
              "4. Interface do Usuário (User Interface - UI)\n* Descrição:\n[Explicação da camada de apresentação do sistema]\n* Tecnologias:\n[Tecnologias utilizadas na interface do usuário]\n* Funcionalidades:\n[Principais funcionalidades e interações da interface do usuário]",
              "5. Controladores (Controllers)\n* Descrição: \n[Explicação da camada de controle e gerenciamento das requisições]\n* Tecnologias:\n[Tecnologias utilizadas nos controladores]\n* Funcionalidades: \n[Principais funcionalidades dos controladores]",
              "6. Serviços (Services)\n* Descrição:\n[Explicação da camada de serviços e lógica de negócio]\n* Tecnologias:\n[Tecnologias utilizadas nos serviços]\n* Funcionalidades:\n[Principais funcionalidades dos serviços]",
              "7. Banco de Dados (Database)\n* Descrição:\n[Explicação da camada de persistência de dados]\n* Tecnologias: \n[Tecnologias utilizadas no banco de dados]\n* Funcionalidades:\n[Principais funcionalidades de armazenamento e consulta de dados]",
              "8. Visão de Implantação\n[Descrição da estratégia de implantação do sistema]"
          ]
      }
  },
  "sofia:starter:project-plan": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\nVocê é um engenheiro de software encarregado de desenvolver um novo sistema. Sua tarefa é elaborar um Plano de Projeto com base no contexto fornecido acima em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown. %{general_instructions}%",
          "loop": [
              "1. Objetivos do Projeto:\n[...]",
              "2. Escopo do Projeto:\n[...]",
              "3. Cronograma:\n[em tabelas]\n[...]",
              "4. Recursos Necessários:\n[...]",
              "5. Orçamento:\n[...]",
              "6. Riscos:\n[...]",
              "7. Comunicação:\n[...]",
              "8. Qualidade:\n[...]",
              "9. Stakeholders (Partes Interessadas):\n[...]",
              "10. Gerenciamento de Mudanças:\n[...]"
          ]
      }
  },
  "sofia:starter:project-scope": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}%\nVocê é um engenheiro de software encarregado de desenvolver um novo sistema. Sua tarefa é elaborar um Documento de Escopo do Projeto com base no contexto fornecido acima em markdown. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown. %{general_instructions}%",
          "loop": [
              "1. Descrição do Projeto:\n[...]",
              "2. Declaração do Escopo:\n[...]",
              "3. Critérios de Aceitação:\n[...]",
              "4. Limites do Projeto:\n[...]",
              "5. Entregas:\n[em tabelas]\n[...]",
              "6. Restrições e Assunções:\n[...]",
              "7. Estrutura Analítica do Projeto (EAP):\n[...]"
          ]
      }
  },
  "sofia:starter:requirement-document": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "%{context}% \\nVocê é um engenheiro de software encarregado de desenvolver um novo sistema. Sua tarefa é elaborar o documento de requisitos funcionais e não funcionais para este sistema. Não quero nada ilustrativo, quero o documento para um projeto real. Irei adicionar cada etapa em uma mensagem diferente, quero me responda em markdown. %{general_instructions}%",
          "loop": [
              "1. Requisitos Funcionais:\n[...]",
              "2. Requisitos Não Funcionais:\n[...]",
              "3. Requisitos de interface:\n[...]",
              "4. Atributos de qualidade\n[...]",
              "5. Restrições\n[...]"
          ]
      }
  },
  "sofia:starter:user-stories": {
      "parameters": {
          "context": {
              "type": "string"
          },
          "general_instructions": {
              "type": "string"
          }
      },
      "prompts": {
          "header": "Você é um especialista em engenharia ágil e product management. Sua tarefa é escrever user stories detalhadas e bem estruturadas com base na descrição do épico fornecida. As user stories devem ser claras, orientadas ao valor para o usuário e com critérios de aceitação objetivos. Responda em markdown.\n\n%{general_instructions}%",
          "loop": [
              "Com base na descrição do épico abaixo, escreva as **User Stories** detalhadas:\n\n%{context}%\n\n---\n\nPara cada user story, siga o formato:\n\n## US-[N]: [Título da User Story]\n\n**Como** [tipo de usuário],\n**Quero** [ação ou funcionalidade],\n**Para que** [benefício ou valor gerado].\n\n### Critérios de Aceitação\n- [ ] [Critério 1]\n- [ ] [Critério 2]\n- [ ] [Critério N]\n\n### Notas Técnicas\n[Observações técnicas relevantes para o desenvolvimento]\n\n### Dependências\n[Outras user stories ou sistemas dos quais esta depende]\n\nEscreva todas as user stories necessárias para cobrir completamente o épico. Retorne o resultado completo em markdown."
          ]
      }
  }
}
