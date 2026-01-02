# Feature Specification: Filtro de Projetos na Exportação
 
 **Feature Branch**: `001-export-project-filter`  
 **Created**: 2025-12-15  
 **Status**: Draft  
 **Input**: User description: "Faça um filtro permitindo escolher quais projetos você deseja copiar para planilha"

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

 ### User Story 1 - Selecionar projetos para copiar (Priority: P1)
 
Como usuário, quero escolher quais projetos entram no texto copiado para colar na planilha, para evitar retrabalho removendo linhas indesejadas.
 
 **Why this priority**: Impacta diretamente o objetivo principal do app (copiar para planilha) e reduz retrabalho.
 
 **Independent Test**: Carregar um dia com lançamentos de múltiplos projetos, selecionar um subconjunto e copiar; verificar que somente os projetos selecionados foram incluídos.
 
 **Acceptance Scenarios**:
 
 1. **Given** um dia carregado com lançamentos em pelo menos 2 projetos distintos, **When** eu desmarco 1 projeto no filtro e copio para a área de transferência, **Then** o texto copiado NÃO contém linhas referentes ao projeto desmarcado.
 2. **Given** um dia carregado com lançamentos, **When** eu marco somente 1 projeto e copio, **Then** o texto copiado contém apenas linhas desse projeto.

---

 ### User Story 2 - Lembrar seleção de projetos (Priority: P2)
 
Como usuário, quero que o sistema lembre a minha seleção de projetos, para eu não precisar reconfigurar o filtro toda vez.
 
 **Why this priority**: Aumenta produtividade em uso recorrente.
 
 **Independent Test**: Selecionar projetos, recarregar a aplicação e validar que a seleção anterior reaparece.
 
 **Acceptance Scenarios**:
 
 1. **Given** que eu selecionei um subconjunto de projetos, **When** eu fecho e reabro a aplicação no mesmo dispositivo, **Then** o filtro inicia com o mesmo subconjunto selecionado.

---

 ### User Story 3 - Facilitar seleção (selecionar tudo/nenhum) (Priority: P3)
 
Como usuário, quero ações rápidas para selecionar/desselecionar todos os projetos, para ajustar o filtro rapidamente.
 
 **Why this priority**: Melhora UX quando há muitos projetos.
 
 **Independent Test**: Em um dia com vários projetos, usar ações rápidas e verificar que o estado do filtro muda conforme esperado.
 
 **Acceptance Scenarios**:
 
 1. **Given** um dia com 5+ projetos, **When** eu aciono "Selecionar tudo", **Then** todos os projetos ficam selecionados.
 2. **Given** um dia com projetos selecionados, **When** eu aciono "Selecionar nenhum", **Then** nenhum projeto fica selecionado.

---

 ### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

 - O que acontece quando não há lançamentos carregados (lista de projetos vazia)?
 - O que acontece quando o usuário desmarca todos os projetos?
 - O que acontece quando a lista de projetos muda após recarregar um dia diferente?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

 ### Functional Requirements
 
 - **FR-001**: O sistema MUST exibir ao usuário a lista de projetos presentes nos lançamentos carregados do dia.
 - **FR-002**: O usuário MUST poder selecionar/desselecionar projetos individualmente.
 - **FR-003**: O sistema MUST considerar apenas projetos selecionados ao gerar o texto a ser copiado para planilha.
 - **FR-004**: Quando a lista de projetos estiver vazia, o sistema MUST indicar que não há projetos para filtrar e MUST manter a cópia desabilitada (ou equivalente) por ausência de conteúdo.
 - **FR-005**: Se nenhum projeto estiver selecionado, o sistema MUST impedir a cópia de um conteúdo incorreto (ex.: copiar vazio) e MUST informar claramente o motivo.
 - **FR-006**: O sistema MUST lembrar a seleção de projetos no mesmo dispositivo.
 - **FR-007**: O sistema MUST oferecer ações rápidas para "Selecionar tudo" e "Selecionar nenhum".

 ### Assumptions

 - O filtro se baseia nos projetos presentes nos lançamentos do dia carregado.
 - A seleção de projetos é aplicada somente ao conteúdo copiado para planilha, sem alterar os lançamentos na fonte.
 - A seleção é persistida no mesmo dispositivo, sem expectativa de sincronização entre dispositivos.
 - Quando um novo projeto aparecer na lista (dia diferente), o comportamento padrão é manter o filtro utilizável sem exigir configuração imediata.

 ### Key Entities *(include if feature involves data)*
 
 - **Projeto**: Identificador de projeto exibido ao usuário para seleção.
 - **Seleção de Projetos**: Conjunto de projetos marcados para compor o texto copiado.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

 ### Measurable Outcomes
 
 - **SC-001**: Usuário consegue copiar para planilha contendo somente os projetos selecionados.
 - **SC-002**: Em um dia com pelo menos 2 projetos, 0 linhas de projetos desmarcados aparecem no texto copiado.
 - **SC-003**: Usuário consegue configurar o filtro (selecionar subconjunto) em até 30 segundos.
 - **SC-004**: Seleção do filtro é preservada entre reaberturas no mesmo dispositivo.
