# Implementation Plan: Guia Interativo do Usuário

**Branch**: `002-user-guide` | **Date**: 2024-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-user-guide/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.windsurf/workflows/speckit.plan.md` for the execution workflow.

## Summary

Implementar sistema de onboarding e ajuda contextual para guiar usuários no uso da aplicação Clockify Extension. A funcionalidade inclui: (1) tour interativo automático para novos usuários guiando através dos passos básicos (API Key → Carregar Entradas → Exportar), (2) ajuda contextual em demanda via ícones (?) ao lado de seções complexas, e (3) central de ajuda com opção de reiniciar tour e acessar FAQ.

**Abordagem Técnica**: Utilizar biblioteca de tour interativo (ex: react-joyride ou driver.js) para criar experiência guiada com spotlight/overlay. Persistir estado do tour em localStorage. Criar componentes de tooltip/modal para ajuda contextual. Seguir arquitetura existente com hooks para lógica de estado do tour e componentes de apresentação para UI.

## Technical Context

**Language/Version**: TypeScript 5.x com Next.js 16.0.8 (App Router)  
**Primary Dependencies**: React 19.2.1, Next.js 16.0.8, TailwindCSS 4.x, [NEEDS CLARIFICATION: biblioteca de tour - react-joyride vs driver.js vs intro.js]  
**Storage**: localStorage (browser) para persistir estado do tour e preferências de ajuda  
**Testing**: NEEDS CLARIFICATION (não identificado no package.json - necessário definir framework de testes)  
**Target Platform**: Navegadores modernos (Chrome, Firefox, Safari, Edge) com suporte a localStorage e ES2020+
**Project Type**: Web application (Next.js App Router com client-side state management)  
**Performance Goals**: 
- Tour deve iniciar em < 500ms após carregamento da página
- Transições entre passos do tour < 200ms
- Tooltips de ajuda devem aparecer instantaneamente (< 100ms)
**Constraints**: 
- Offline-capable (tour funciona sem conexão após primeiro carregamento)
- Sem backend (dados persistidos localmente em localStorage)
- Responsivo (funcionar em desktop e mobile)
- Acessível (WCAG 2.1 AA - navegação por teclado, ARIA labels)
**Scale/Scope**: 
- 3 passos principais no tour inicial
- ~5-10 seções com ajuda contextual
- ~5-10 perguntas no FAQ
- Single-user application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Princípio I: UI por responsabilidade 
**Status**: PASS  
**Plano**: Criar componentes React de apresentação (`TourOverlay`, `HelpTooltip`, `HelpMenu`, `FAQModal`) que recebem dados e callbacks via props. Nenhuma lógica de negócio ou persistência nos componentes.

### Princípio II: Lógica em custom hooks ✅
**Status**: PASS  
**Plano**: Criar hooks separados por responsabilidade:
- `useTourState`: gerenciar estado do tour (passo atual, completado, pulado)
- `useHelpContent`: carregar e gerenciar conteúdo de ajuda contextual
- Toda lógica de detecção de primeira visita, persistência, e progressão do tour nos hooks

### Princípio III: Testabilidade obrigatória ⚠️
**Status**: NEEDS CLARIFICATION  
**Questão**: Framework de testes não identificado no projeto. Necessário definir se será Jest, Vitest, ou outro.
**Impacto**: Hooks e lógica de tour devem ser testáveis isoladamente.

### Princípio IV: Arquitetura por camadas ✅
**Status**: PASS  
**Plano**: Seguir estrutura existente:
- **Domínio**: Tipos e interfaces em `src/domain/tour.ts` (TourState, TourStep, HelpContent)
- **Infraestrutura**: Persistência em `src/infra/storage/tour-storage.ts` (localStorage wrapper)
- **UI**: Hooks em `hooks/` + Componentes em `app/components/`

### Princípio V: Simplicidade e previsibilidade ✅
**Status**: PASS  
**Plano**: Implementação direta sem abstrações desnecessárias. Estado do tour gerenciado por hooks simples. Usar biblioteca de tour estabelecida ao invés de reimplementar spotlight/overlay.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
clockify-extension/
├── app/                          # Next.js App Router (UI)
│   ├── components/
│   │   ├── TourOverlay.tsx       # [NEW] Componente principal do tour
│   │   ├── TourStep.tsx          # [NEW] Componente de passo individual
│   │   ├── HelpTooltip.tsx       # [NEW] Tooltip de ajuda contextual
│   │   ├── HelpIcon.tsx          # [NEW] Ícone (?) clicável
│   │   ├── HelpMenu.tsx          # [NEW] Menu dropdown de ajuda no header
│   │   ├── FAQModal.tsx          # [NEW] Modal com perguntas frequentes
│   │   └── ApiKeySection.tsx     # [MODIFY] Adicionar HelpIcon
│   ├── layout.tsx                # [MODIFY] Adicionar HelpMenu no header
│   └── page.tsx                  # [MODIFY] Integrar TourOverlay
│
├── hooks/                        # Custom React hooks
│   ├── useTourState.ts           # [NEW] Estado e lógica do tour
│   ├── useHelpContent.ts         # [NEW] Conteúdo de ajuda contextual
│   └── useLocalStorage.ts        # [NEW] Wrapper genérico para localStorage
│
├── src/
│   ├── domain/
│   │   └── tour.ts               # [NEW] Tipos e interfaces (TourState, TourStep, HelpContent)
│   │
│   └── infra/
│       └── storage/
│           └── tour-storage.ts   # [NEW] Persistência do tour em localStorage
│
└── public/
    └── help-content.json         # [NEW] Conteúdo estático de ajuda (FAQ, tooltips)
```

**Structure Decision**: Aplicação Next.js com App Router. Arquitetura em camadas seguindo constituição do projeto:
- **UI Layer** (`app/`): Componentes React de apresentação para tour e ajuda
- **Hook Layer** (`hooks/`): Lógica de negócio e orquestração do tour
- **Domain Layer** (`src/domain/`): Tipos, interfaces e contratos
- **Infrastructure Layer** (`src/infra/`): Persistência em localStorage

Estrutura segue padrão existente do projeto (mesmo usado para ProfileMapping e ExportProfiles).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Nenhuma violação identificada.** Todos os princípios da constituição serão seguidos. A única questão pendente (framework de testes) não é uma violação, mas uma clarificação necessária para garantir aderência ao Princípio III.
