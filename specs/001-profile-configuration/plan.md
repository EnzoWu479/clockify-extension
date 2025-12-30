# Implementation Plan: Configuração de Perfis de Exportação

**Branch**: `001-profile-configuration` | **Date**: 2024-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-profile-configuration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.windsurf/workflows/speckit.plan.md` for the execution workflow.

## Summary

Implementar sistema de perfis de exportação que permite ao usuário criar, editar e gerenciar múltiplos perfis de configuração. Cada perfil contém: nome identificador, coluna de horas no Excel (3-20), e lista de projetos do Clockify incluídos. O de-para de projetos (Clockify → Excel) permanece global e é aplicado a todos os perfis. A funcionalidade "Copiar para Planilha Projeto" utilizará o perfil ativo selecionado para filtrar projetos e aplicar a coluna de horas configurada.

**Abordagem Técnica**: Seguir arquitetura existente com camadas de domínio, infraestrutura (IndexedDB) e UI (React hooks + componentes). Criar novas entidades de domínio (ExportProfile, ActiveProfile), repositórios IndexedDB, custom hooks para gerenciamento de estado, e componentes React para UI de gerenciamento de perfis.

## Technical Context

**Language/Version**: TypeScript 5.x com Next.js 16.0.8 (App Router)  
**Primary Dependencies**: React 19.2.1, Next.js 16.0.8, TailwindCSS 4.x  
**Storage**: IndexedDB (browser local storage) via API nativa do navegador  
**Testing**: NEEDS CLARIFICATION (não identificado no package.json - necessário definir framework de testes)  
**Target Platform**: Navegadores modernos (Chrome, Firefox, Safari, Edge) com suporte a IndexedDB e ES2020+
**Project Type**: Web application (Next.js App Router com client-side state management)  
**Performance Goals**: 
- Carregamento de perfis < 100ms
- Alternância entre perfis instantânea (< 50ms)
- Operações CRUD de perfis < 200ms
**Constraints**: 
- Offline-capable (dados persistidos localmente em IndexedDB)
- Sem backend (aplicação 100% client-side)
- Compatibilidade com funcionalidade existente (operação sem perfil deve funcionar)
**Scale/Scope**: 
- ~10-50 perfis por usuário (uso típico: 3-5 perfis)
- ~5-20 projetos por perfil
- Single-user application (sem multi-tenancy)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Princípio I: UI por responsabilidade ✅
**Status**: PASS  
**Plano**: Criar componentes React de apresentação (`ProfileList`, `ProfileForm`, `ProfileSelector`) que recebem dados e callbacks via props. Nenhuma lógica de negócio ou persistência nos componentes.

### Princípio II: Lógica em custom hooks ✅
**Status**: PASS  
**Plano**: Criar hooks separados por responsabilidade:
- `useExportProfiles`: gerenciamento CRUD de perfis
- `useActiveProfile`: gerenciamento do perfil ativo selecionado
- Reutilizar `useProjectMappings` existente para de-para global
- Modificar `useClockifyExportText` para aceitar filtro de projetos do perfil ativo

### Princípio III: Testabilidade obrigatória ⚠️
**Status**: NEEDS CLARIFICATION  
**Questão**: Framework de testes não identificado no projeto. Necessário definir se será Jest, Vitest, ou outro.
**Impacto**: Hooks e repositórios devem ser testáveis isoladamente com mocks de IndexedDB.

### Princípio IV: Arquitetura por camadas ✅
**Status**: PASS  
**Plano**: Seguir estrutura existente:
- **Domínio**: `src/domain/export-profile.ts` (tipos e interfaces)
- **Infraestrutura**: `src/infra/db/indexeddb/export-profile-repository.ts` (persistência)
- **UI**: `hooks/useExportProfiles.ts` + `app/components/Profile*.tsx`

### Princípio V: Simplicidade e previsibilidade ✅
**Status**: PASS  
**Plano**: Implementação direta sem abstrações desnecessárias. Reutilizar padrões existentes (mesmo padrão de ProjectMapping). Estado local gerenciado por hooks, sem state management global complexo.

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
│   │   ├── ProfileSelector.tsx   # [NEW] Dropdown para selecionar perfil ativo
│   │   ├── ProfileList.tsx       # [NEW] Lista de perfis com ações (editar/excluir)
│   │   ├── ProfileForm.tsx       # [NEW] Formulário criar/editar perfil
│   │   ├── ProfileManager.tsx    # [NEW] Container para gerenciamento de perfis
│   │   ├── ExportSettings.tsx    # [MODIFY] Integrar ProfileManager
│   │   └── DaySummaryHeader.tsx  # [MODIFY] Mostrar perfil ativo
│   └── page.tsx                  # [MODIFY] Integrar hooks de perfis
│
├── hooks/                        # Custom React hooks
│   ├── useExportProfiles.ts      # [NEW] CRUD de perfis
│   ├── useActiveProfile.ts       # [NEW] Gerenciar perfil ativo
│   ├── useProjectMappings.ts     # [EXISTING] De-para global (sem mudanças)
│   └── useClockifyExportText.ts  # [MODIFY] Aceitar filtro de projetos
│
├── src/
│   ├── domain/
│   │   ├── export-profile.ts     # [NEW] Tipos e interfaces de perfil
│   │   └── project-mapping.ts    # [EXISTING] Mantém de-para global
│   │
│   └── infra/
│       └── db/
│           └── indexeddb/
│               ├── indexeddb-client.ts              # [MODIFY] Adicionar store de perfis
│               ├── export-profile-repository.ts     # [NEW] Repositório de perfis
│               ├── active-profile-repository.ts     # [NEW] Repositório perfil ativo
│               └── project-mapping-repository.ts    # [EXISTING] Sem mudanças
│
└── tests/                        # [NEEDS CLARIFICATION] Framework a definir
    ├── unit/
    │   ├── export-profile-repository.test.ts
    │   ├── useExportProfiles.test.ts
    │   └── useActiveProfile.test.ts
    └── integration/
        └── profile-export-flow.test.ts
```

**Structure Decision**: Aplicação Next.js com App Router. Arquitetura em camadas seguindo constituição do projeto:
- **UI Layer** (`app/`): Componentes React de apresentação
- **Hook Layer** (`hooks/`): Lógica de negócio e orquestração
- **Domain Layer** (`src/domain/`): Tipos, interfaces e contratos
- **Infrastructure Layer** (`src/infra/`): Persistência IndexedDB

Estrutura segue padrão existente do projeto (mesmo usado para ProjectMapping).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Nenhuma violação identificada.** Todos os princípios da constituição serão seguidos. A única questão pendente (framework de testes) não é uma violação, mas uma clarificação necessária para garantir aderência ao Princípio III.
