# Tasks: Guia Interativo do Usuário

**Input**: Design documents from `/specs/002-user-guide/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Testes NÃO foram solicitados na especificação. Tarefas de teste não estão incluídas neste plano.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Next.js App Router structure
- `app/` for UI components
- `hooks/` for custom React hooks
- `src/domain/` for types and interfaces
- `src/infra/storage/` for persistence layer
- `src/constants/` for static data

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependencies

- [x] T001 Install react-joyride library: `npm install react-joyride`
- [x] T002 Install @floating-ui/react library: `npm install @floating-ui/react`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain and infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create domain types in `src/domain/tour.ts` (TourState, TourStep, HelpContent, FAQItem)
- [x] T004 [P] Create tour steps constants in `src/constants/tour-steps.ts` with TOUR_VERSION and TOUR_STEPS array
- [x] T005 [P] Create help content constants in `src/constants/help-content.ts` with HELP_CONTENT object
- [x] T006 [P] Create FAQ constants in `src/constants/faq.ts` with FAQ_ITEMS array
- [x] T007 Create TourStorage class in `src/infra/storage/tour-storage.ts` with get/set/clear/isFirstVisit methods

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Tour Inicial para Novos Usuários (Priority: P1) 🎯 MVP

**Goal**: Implementar tour interativo automático que guia novos usuários através dos 3 passos básicos: configurar API Key → carregar entradas → copiar para Excel.

**Independent Test**: Acessar aplicação em modo anônimo (sem dados em localStorage), verificar que tour inicia automaticamente, completar os 3 passos ou pular, verificar que tour não reaparece.

### Implementation for User Story 1

- [x] T008 [P] [US1] Implement useTourState hook in `hooks/useTourState.ts` with state management, nextStep, skipTour, resetTour methods
- [x] T009 [P] [US1] Create TourOverlay component in `app/components/TourOverlay.tsx` integrating react-joyride with custom styles
- [x] T010 [US1] Modify page.tsx in `app/page.tsx` to integrate useTourState hook and render TourOverlay component
- [x] T011 [US1] Add IDs to target elements in existing components: #api-key-input in ApiKeySection, #load-entries-button in DateControls, #copy-project-button in DaySummaryHeader
- [x] T012 [US1] Test tour flow: primeira visita → tour automático → completar 3 passos → verificar persistência → recarregar → tour não aparece

**Checkpoint**: At this point, User Story 1 should be fully functional - users can see and complete the interactive tour on first visit

---

## Phase 4: User Story 2 - Ajuda Contextual em Demanda (Priority: P2)

**Goal**: Implementar ícones de ajuda (?) ao lado de seções complexas que exibem tooltips explicativos ao clicar.

**Independent Test**: Clicar nos ícones (?) ao lado de "Perfis de Exportação", "De-Para de Projetos", e "Coluna de Horas", verificar que tooltips aparecem com explicações e exemplos.

### Implementation for User Story 2

- [x] T013 [P] [US2] Implement useHelpContent hook in `hooks/useHelpContent.ts` with getContent and getAllContent methods
- [x] T014 [P] [US2] Create HelpIcon component in `app/components/HelpIcon.tsx` with (?) button
- [x] T015 [P] [US2] Create HelpTooltip component in `app/components/HelpTooltip.tsx` integrating @floating-ui/react for positioning
- [x] T016 [US2] Add HelpIcon to ApiKeySection component in `app/components/ApiKeySection.tsx` with id="api-key"
- [x] T017 [US2] Add HelpIcon to ExportSettings component in `app/components/ExportSettings.tsx` for profiles section with id="export-profiles"
- [x] T018 [US2] Add HelpIcon to ExportSettings component in `app/components/ExportSettings.tsx` for project mapping section with id="project-mapping"
- [x] T019 [US2] Add HelpIcon to ExportSettings component in `app/components/ExportSettings.tsx` for hours column section with id="hours-column"
- [x] T020 [US2] Implement tooltip state management in page.tsx to show/hide HelpTooltip based on clicked HelpIcon
- [x] T021 [US2] Test help tooltips: clicar cada ícone (?), verificar tooltip aparece, clicar fora fecha, pressionar ESC fecha

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - tour for new users + contextual help for all users

---

## Phase 5: User Story 3 - Reexibir Tour e Central de Ajuda (Priority: P3)

**Goal**: Implementar menu de ajuda no header com opções para reiniciar tour, acessar FAQ, e ver atalhos.

**Independent Test**: Clicar botão "Ajuda" no header, verificar menu dropdown com opções, clicar "Reiniciar Tour" reinicia tour, clicar "FAQ" abre modal com perguntas.

### Implementation for User Story 3

- [x] T022 [P] [US3] Create HelpMenu component in `app/components/HelpMenu.tsx` with dropdown menu (Reiniciar Tour, FAQ, Atalhos)
- [x] T023 [P] [US3] Create FAQModal component in `app/components/FAQModal.tsx` displaying FAQ_ITEMS grouped by category
- [x] T024 [US3] Modify layout.tsx in `app/layout.tsx` to add HelpMenu button in header
- [x] T025 [US3] Integrate HelpMenu with useTourState.resetTour in page.tsx to restart tour
- [x] T026 [US3] Implement FAQ modal state management in page.tsx to show/hide FAQModal
- [x] T027 [US3] Test help menu: clicar botão Ajuda, verificar menu, reiniciar tour funciona, FAQ modal abre e fecha, categorias organizadas

**Checkpoint**: All user stories should now be independently functional - complete onboarding and help system

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T028 [P] Add responsive styles to TourOverlay for mobile devices (adjust tooltip size, button touch targets)
- [x] T029 [P] Add ARIA labels and keyboard navigation support to all tour and help components
- [x] T030 [P] Verify tour works correctly when user closes browser mid-tour (state persists)
- [x] T031 [P] Verify tour handles window resize gracefully (tooltips reposition)
- [x] T032 Test edge cases: múltiplas abas, localStorage limpo, API Key inválida durante tour
- [x] T033 Performance check: tour inicia < 500ms, transições < 200ms, tooltips < 100ms
- [x] T034 Accessibility audit: navegação por teclado, screen readers, contraste de cores

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent from US1 (but complements it)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires US1 (resetTour functionality)

### Within Each User Story

- Hooks before components (hooks provide state/logic)
- Components before integration (components need to exist)
- Core implementation before edge cases
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: Both npm install commands can run together
- **Phase 2**: T004, T005, T006 (constants files) can run in parallel
- **Phase 3**: T008 and T009 can run in parallel (different files)
- **Phase 4**: T013, T014, T015 can run in parallel (different files)
- **Phase 4**: T016, T017, T018, T019 can run in parallel (adding icons to different sections)
- **Phase 5**: T022 and T023 can run in parallel (different files)
- **Phase 6**: T028, T029, T030, T031 can run in parallel (different concerns)

---

## Parallel Example: User Story 1

```bash
# Launch hooks and components together:
Task T008: "Implement useTourState hook in hooks/useTourState.ts"
Task T009: "Create TourOverlay component in app/components/TourOverlay.tsx"

# Then integrate sequentially:
Task T010: "Modify page.tsx to integrate useTourState and TourOverlay"
Task T011: "Add IDs to target elements"
Task T012: "Test tour flow"
```

---

## Parallel Example: User Story 2

```bash
# Launch all independent components together:
Task T013: "Implement useHelpContent hook in hooks/useHelpContent.ts"
Task T014: "Create HelpIcon component in app/components/HelpIcon.tsx"
Task T015: "Create HelpTooltip component in app/components/HelpTooltip.tsx"

# Launch all icon additions together:
Task T016: "Add HelpIcon to ApiKeySection"
Task T017: "Add HelpIcon to ExportSettings (profiles)"
Task T018: "Add HelpIcon to ExportSettings (mapping)"
Task T019: "Add HelpIcon to ExportSettings (hours)"

# Then integrate sequentially:
Task T020: "Implement tooltip state management in page.tsx"
Task T021: "Test help tooltips"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install dependencies)
2. Complete Phase 2: Foundational (domain types, constants, storage)
3. Complete Phase 3: User Story 1 (tour interativo)
4. **STOP and VALIDATE**: Test tour independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add Polish → Final validation → Deploy
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (tour)
   - Developer B: User Story 2 (help tooltips)
   - Developer C: User Story 3 (help menu + FAQ)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Tour uses react-joyride library (decision from research.md)
- Tooltips use @floating-ui/react for positioning (decision from research.md)
- State persisted in localStorage via TourStorage class
- No tests included (not requested in specification)
