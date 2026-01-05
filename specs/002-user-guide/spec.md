# Feature Specification: Guia Interativo do Usuário

**Feature Branch**: `002-user-guide`  
**Created**: 2024-12-30  
**Status**: Draft  
**Input**: User description: "Funcionalidade de guia que vai guiar o usuario como se usa"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Tour Inicial para Novos Usuários (Priority: P1)

O usuário que acessa a aplicação pela primeira vez precisa entender rapidamente como configurar sua API Key do Clockify, carregar suas entradas de tempo, e exportar os dados para Excel. Um tour interativo passo a passo deve guiá-lo através do fluxo básico: configurar API Key → carregar entradas → copiar para Excel.

**Why this priority**: Esta é a funcionalidade central que reduz a curva de aprendizado e permite que novos usuários sejam produtivos imediatamente, sem necessidade de documentação externa ou suporte.

**Independent Test**: Pode ser testado acessando a aplicação em modo anônimo/privado (sem dados salvos), verificando que o tour inicia automaticamente e guia o usuário através dos 3 passos principais, podendo ser completado ou pulado a qualquer momento.

**Acceptance Scenarios**:

1. **Given** o usuário acessa a aplicação pela primeira vez (sem histórico de uso), **When** a página carrega, **Then** um tour interativo é exibido automaticamente destacando o campo de API Key
2. **Given** o usuário está no passo 1 do tour (API Key), **When** insere e ativa a API Key, **Then** o tour avança automaticamente para o passo 2 (carregar entradas)
3. **Given** o usuário está no passo 2 do tour, **When** carrega entradas de um dia, **Then** o tour avança para o passo 3 (exportar)
4. **Given** o usuário está em qualquer passo do tour, **When** clica em "Pular tour", **Then** o tour é fechado e não aparece novamente
5. **Given** o usuário completou o tour, **When** acessa a aplicação novamente, **Then** o tour não é exibido automaticamente

---

### User Story 2 - Ajuda Contextual em Demanda (Priority: P2)

O usuário que já conhece o básico mas precisa de ajuda com funcionalidades específicas (perfis de exportação, de-para de projetos, configurações avançadas) deve poder acessar dicas contextuais sem sair do fluxo de trabalho. Um botão de ajuda (?) ao lado de cada seção complexa deve exibir tooltips ou modais explicativos.

**Why this priority**: Permite que usuários intermediários aprendam funcionalidades avançadas de forma autônoma, reduzindo fricção e aumentando a adoção de features como perfis de exportação.

**Independent Test**: Pode ser testado clicando nos ícones de ajuda (?) ao lado de "Perfis de Exportação", "De-Para de Projetos", e "Coluna de Horas", verificando que cada um exibe uma explicação clara e exemplos práticos.

**Acceptance Scenarios**:

1. **Given** o usuário está na seção de Perfis de Exportação, **When** clica no ícone de ajuda (?), **Then** um tooltip ou modal explica o que são perfis e como criá-los
2. **Given** o usuário está configurando o de-para de projetos, **When** clica no ícone de ajuda, **Then** uma explicação com exemplo ("Projeto XYZ" → "PJ-XYZ") é exibida
3. **Given** o usuário está ajustando a coluna de horas, **When** clica no ícone de ajuda, **Then** uma explicação visual mostra como a coluna afeta o Excel (A=1, B=2, etc.)
4. **Given** o usuário visualiza uma ajuda contextual, **When** clica fora do tooltip/modal, **Then** a ajuda é fechada e o usuário retorna ao fluxo normal

---

### User Story 3 - Reexibir Tour e Central de Ajuda (Priority: P3)

O usuário que já completou o tour inicial mas deseja revisá-lo ou acessar uma central de ajuda completa deve poder fazê-lo através de um menu ou botão dedicado. Uma seção de "Ajuda" deve permitir reiniciar o tour, acessar FAQ, ou ver atalhos de teclado.

**Why this priority**: Oferece suporte contínuo para usuários que precisam relembrar funcionalidades ou explorar recursos avançados, mas não é crítico para o uso inicial.

**Independent Test**: Pode ser testado acessando o menu de ajuda (ícone ? no header), verificando que é possível reiniciar o tour, visualizar FAQ com perguntas comuns, e ver lista de atalhos de teclado disponíveis.

**Acceptance Scenarios**:

1. **Given** o usuário já completou o tour inicial, **When** clica no botão "Ajuda" no header, **Then** um menu dropdown é exibido com opções: "Reiniciar Tour", "FAQ", "Atalhos"
2. **Given** o usuário abre o menu de ajuda, **When** clica em "Reiniciar Tour", **Then** o tour inicial é reiniciado do passo 1
3. **Given** o usuário abre o menu de ajuda, **When** clica em "FAQ", **Then** um modal com perguntas frequentes é exibido (ex: "Como obter API Key?", "O que são perfis?")
4. **Given** o usuário abre o menu de ajuda, **When** clica em "Atalhos", **Then** uma lista de atalhos de teclado é exibida (se houver)

### Edge Cases

- O que acontece quando o usuário fecha o navegador no meio do tour?
- Como o sistema lida quando o usuário tenta pular para um passo do tour sem completar o anterior?
- O que acontece se o usuário limpa os dados do navegador (localStorage) após completar o tour?
- Como o sistema se comporta se o tour é iniciado mas a API Key está inválida?
- O que acontece quando o usuário redimensiona a janela durante o tour (responsividade)?
- Como o sistema lida com múltiplas abas abertas simultaneamente (sincronização de estado do tour)?
- O que acontece se o usuário tenta acessar ajuda contextual em uma seção que ainda não tem conteúdo carregado?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: Sistema DEVE exibir tour interativo automaticamente na primeira visita do usuário
- **FR-002**: Sistema DEVE detectar primeira visita através de flag persistida em localStorage
- **FR-003**: Sistema DEVE permitir que o usuário pule o tour a qualquer momento
- **FR-004**: Sistema DEVE persistir o estado de conclusão do tour para não exibi-lo novamente
- **FR-005**: Sistema DEVE destacar visualmente o elemento atual do tour (spotlight/overlay)
- **FR-006**: Sistema DEVE avançar automaticamente para o próximo passo quando o usuário completa a ação esperada
- **FR-007**: Sistema DEVE permitir navegação manual entre passos do tour (Anterior/Próximo)
- **FR-008**: Sistema DEVE exibir indicador de progresso do tour (ex: "Passo 2 de 3")
- **FR-009**: Sistema DEVE fornecer ícones de ajuda (?) ao lado de seções complexas
- **FR-010**: Sistema DEVE exibir tooltips ou modais explicativos ao clicar nos ícones de ajuda
- **FR-011**: Sistema DEVE incluir botão "Ajuda" no header da aplicação
- **FR-012**: Sistema DEVE permitir reiniciar o tour através do menu de ajuda
- **FR-013**: Sistema DEVE exibir FAQ com perguntas frequentes no menu de ajuda
- **FR-014**: Sistema DEVE posicionar tooltips de forma inteligente para não cobrir conteúdo importante
- **FR-015**: Sistema DEVE ser responsivo e adaptar o tour para diferentes tamanhos de tela
- **FR-016**: Sistema DEVE fechar tooltips/modais ao clicar fora deles ou pressionar ESC
- **FR-017**: Sistema DEVE manter acessibilidade (ARIA labels, navegação por teclado) durante o tour

### Key Entities

- **Tour State**: Representa o estado do tour do usuário, incluindo se foi completado, qual passo atual, e se foi pulado. Atributos: tourCompleted (boolean), currentStep (number), skipped (boolean), completedAt (timestamp)
- **Help Content**: Representa o conteúdo de ajuda contextual para cada seção da aplicação. Atributos: sectionId (string), title (string), description (string), examples (array), relatedLinks (array)
- **Tour Step**: Representa um passo individual do tour. Atributos: stepNumber (number), targetElement (selector), title (string), description (string), action (string), completionTrigger (event)

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Novos usuários conseguem configurar API Key e realizar primeira exportação em menos de 3 minutos com o tour
- **SC-002**: Pelo menos 70% dos novos usuários completam o tour inicial sem pular
- **SC-003**: Usuários que completam o tour têm taxa de sucesso 50% maior na primeira exportação comparado aos que pulam
- **SC-004**: Tempo médio para aprender funcionalidades avançadas (perfis) reduz de 10 minutos para 3 minutos com ajuda contextual
- **SC-005**: Taxa de abandono na primeira visita reduz em 40% após implementação do tour
- **SC-006**: Pelo menos 80% dos usuários conseguem acessar e utilizar a ajuda contextual quando necessário
