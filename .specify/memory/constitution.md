<!--
Sync Impact Report
- Version change: template -> 0.1.0
- Modified principles: N/A
- Added sections:
  - Core Principles (conteúdo completo)
  - Project Constraints
  - Development Workflow
- Removed sections: N/A
- Templates requiring updates:
  - ⚠ .specify/templates/plan-template.md (referência a `.specify/templates/commands/plan.md` não existe no repo)
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
  - ✅ .specify/templates/checklist-template.md
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): data de ratificação original não foi encontrada no repositório
-->

# clockify-extension Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### I. UI por responsabilidade (componentes sem lógica)
Componentes React MUST ser primariamente de apresentação e composição.

- Componentes MUST receber dados e callbacks por props.
- Componentes MUST NOT conter regras de negócio, orquestração de chamadas, ou persistência.
- Side-effects, coordenação de estado e regras de negócio MUST viver fora do componente.

### II. Lógica em custom hooks (separados por responsabilidade)
Qualquer lógica reaproveitável e/ou não-trivial MUST ser extraída para custom hooks.

- Hooks MUST ser separados por responsabilidade (um hook = uma intenção clara).
- Hooks MUST expor uma API pequena e previsível (estado, ações, status e erros).
- Hooks MUST NOT depender de detalhes de UI (ex.: elementos DOM específicos), exceto quando o propósito for UI (ex.: focus/keyboard).

### III. Testabilidade obrigatória (hooks e regras)
Custom hooks e funções puras de domínio MUST ser testáveis de forma isolada.

- Hooks MUST permitir testes sem rede e sem IO real (usar injeção de dependências/adapters quando necessário).
- Regras de negócio MUST ser extraídas para funções puras quando possível.
- Todo bug fix ou feature com lógica MUST incluir testes que cubram cenários críticos.

### IV. Arquitetura por camadas (domínio/infra/UI)
O repositório MUST manter separação clara entre domínio, infraestrutura e UI.

- Regras de domínio MUST viver em módulos de domínio.
- Acesso a storage, APIs externas e browser APIs MUST ser encapsulado em infraestrutura.
- UI MUST consumir hooks/serviços, não reimplementar regras.

### V. Simplicidade e previsibilidade
Preferir implementações simples, explícitas e fáceis de inspecionar.

- Evitar acoplamento oculto e estados globais não rastreáveis.
- Evitar abstrações sem necessidade (YAGNI).

## Project Constraints
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

- Plataforma alvo: Next.js (App Router) com TypeScript.
- Persistência local e integrações MUST ser encapsuladas em camadas/serviços/hook.

## Development Workflow
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

- PRs MUST validar aderência aos princípios acima.
- Mudanças que introduzem lógicas novas MUST atualizar/introduzir testes.

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

- Esta constituição define regras não-negociáveis para arquitetura e qualidade.
- Emendas MUST atualizar o **Version** com SemVer:
  - MAJOR: remoção/redefinição incompatível de princípios ou governança
  - MINOR: adição de novo princípio/seção ou expansão material
  - PATCH: ajustes editoriais/clareza sem impacto material
- Toda emenda MUST incluir um Sync Impact Report no topo deste arquivo.

**Version**: 0.1.0 | **Ratified**: TODO(RATIFICATION_DATE): data original desconhecida | **Last Amended**: 2025-12-15
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
