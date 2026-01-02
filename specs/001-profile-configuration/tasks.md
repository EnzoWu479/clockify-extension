# Tasks: Configuração de Perfis de Exportação

**Input**: Design documents from `/specs/001-profile-configuration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

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
- `src/infra/db/indexeddb/` for persistence layer

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependencies

- [ ] T001 Install Vitest and testing dependencies: `npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom fake-indexeddb @vitejs/plugin-react`
- [ ] T002 [P] Create Vitest configuration file `vitest.config.ts` with jsdom environment
- [ ] T003 [P] Create Vitest setup file `vitest.setup.ts` with testing-library matchers

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain and infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create domain types and interfaces in `src/domain/export-profile.ts` (ExportProfile, ActiveProfile, ExportProfileRepository, ActiveProfileRepository)
- [ ] T005 Update IndexedDB client in `src/infra/db/indexeddb/indexeddb-client.ts` to version 2 with exportProfiles and activeProfile stores
- [ ] T006 [P] Implement ExportProfileRepository in `src/infra/db/indexeddb/export-profile-indexeddb-repository.ts` with methods: listAll, findById, findByName, create, update, delete
- [ ] T007 [P] Implement ActiveProfileRepository in `src/infra/db/indexeddb/active-profile-indexeddb-repository.ts` with methods: get, set, clear

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Criar e Selecionar Perfil de Exportação (Priority: P1) 🎯 MVP

**Goal**: Permitir ao usuário criar perfis de exportação com nome, coluna de horas, e projetos selecionados. Usuário pode selecionar um perfil ativo que será usado na funcionalidade "Copiar para Planilha Projeto".

**Independent Test**: Criar perfil com nome "Cliente A", definir coluna 5 para horas, selecionar 2 projetos específicos, verificar que perfil é salvo. Selecionar o perfil e verificar que exportação usa apenas os projetos configurados com a coluna definida.

### Implementation for User Story 1

- [ ] T008 [P] [US1] Implement useExportProfiles hook in `hooks/useExportProfiles.ts` with state management, CRUD operations (createProfile, updateProfile, deleteProfile), and validation logic
- [ ] T009 [P] [US1] Implement useActiveProfile hook in `hooks/useActiveProfile.ts` with state management and methods (setActiveProfile, clearActiveProfile, getActiveProfile)
- [ ] T010 [US1] Modify useClockifyExportText hook in `hooks/useClockifyExportText.ts` to accept optional allowedProjectNames parameter and filter groupedEntries accordingly
- [ ] T011 [P] [US1] Create ProfileForm component in `app/components/ProfileForm.tsx` with controlled inputs for name, hoursColumnIndex, and project selection checkboxes
- [ ] T012 [P] [US1] Create ProfileList component in `app/components/ProfileList.tsx` to display profiles with edit/delete actions and active indicator
- [ ] T013 [P] [US1] Create ProfileSelector component in `app/components/ProfileSelector.tsx` as dropdown to select active profile with "Nenhum (padrão)" option
- [ ] T014 [US1] Create ProfileManager component in `app/components/ProfileManager.tsx` to compose ProfileList, ProfileForm, and ProfileSelector with modal state management
- [ ] T015 [US1] Modify ExportSettings component in `app/components/ExportSettings.tsx` to integrate ProfileManager section
- [ ] T016 [US1] Modify DaySummaryHeader component in `app/components/DaySummaryHeader.tsx` to display active profile name
- [ ] T017 [US1] Modify page.tsx in `app/page.tsx` to integrate useExportProfiles and useActiveProfile hooks, pass activeProfile data to useClockifyExportText with allowedProjectNames and hoursColumnIndex

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create profiles, select them, and export with profile-specific configuration

---

## Phase 4: User Story 2 - Editar e Excluir Perfis (Priority: P2)

**Goal**: Permitir ao usuário editar perfis existentes (nome, coluna, projetos) e excluir perfis não mais utilizados com confirmação.

**Independent Test**: Editar perfil existente mudando nome de "Cliente A" para "Cliente A - 2024", adicionar novo projeto, verificar mudanças persistidas. Excluir perfil e verificar que não aparece mais na lista.

### Implementation for User Story 2

- [ ] T018 [US2] Add edit mode support to ProfileForm component in `app/components/ProfileForm.tsx` with initialData prop to pre-populate form fields
- [ ] T019 [US2] Add edit button handler to ProfileList component in `app/components/ProfileList.tsx` to open ProfileForm in edit mode
- [ ] T020 [US2] Add delete confirmation dialog to ProfileList component in `app/components/ProfileList.tsx` before calling deleteProfile
- [ ] T021 [US2] Update ProfileManager component in `app/components/ProfileManager.tsx` to handle edit mode state and pass correct profile data to ProfileForm
- [ ] T022 [US2] Implement logic in useExportProfiles hook in `hooks/useExportProfiles.ts` to handle deletion of active profile by calling clearActiveProfile from useActiveProfile
- [ ] T023 [US2] Add toast notification in `app/page.tsx` when active profile is deleted to inform user "Perfil [nome] excluído. Usando configuração padrão."

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - full CRUD operations on profiles

---

## Phase 5: User Story 3 - Gerenciar De-Para Global de Projetos (Priority: P3)

**Goal**: Garantir que o de-para global de projetos (já existente) seja aplicado consistentemente a todos os perfis durante exportação.

**Independent Test**: Configurar de-para global "Projeto Interno XYZ" → "PI-XYZ", criar dois perfis diferentes que incluem este projeto, verificar que ambos exportam com valor "PI-XYZ".

### Implementation for User Story 3

- [ ] T024 [US3] Verify that useProjectMappings hook in `hooks/useProjectMappings.ts` is correctly integrated with useClockifyExportText
- [ ] T025 [US3] Verify that getExcelValueForProjectName is applied to filtered projects in useClockifyExportText hook in `hooks/useClockifyExportText.ts`
- [ ] T026 [US3] Add visual indicator in ExportSettings component in `app/components/ExportSettings.tsx` to show that de-para is global and applies to all profiles
- [ ] T027 [US3] Update ProfileForm component in `app/components/ProfileForm.tsx` to show mapped Excel values next to project names in selection list (read-only display)
- [ ] T028 [US3] Verify in `app/page.tsx` that de-para global is applied after profile filtering in the export flow

**Checkpoint**: All user stories should now be independently functional - complete profile system with global de-para integration

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T029 [P] Add loading states to all async operations in ProfileManager component in `app/components/ProfileManager.tsx`
- [ ] T030 [P] Add error handling and error display for all profile operations in ProfileManager component in `app/components/ProfileManager.tsx`
- [ ] T031 [P] Implement keyboard navigation and accessibility attributes (labels, ARIA) in ProfileForm component in `app/components/ProfileForm.tsx`
- [ ] T032 [P] Add visual feedback (disabled states, loading spinners) to ProfileList component in `app/components/ProfileList.tsx`
- [ ] T033 Validate that operation without profile selected maintains backward compatibility in `app/page.tsx`
- [ ] T034 Test edge cases: empty profile name, no projects selected, invalid column number, duplicate profile names
- [ ] T035 Verify persistence between browser sessions by reloading page and checking active profile is maintained
- [ ] T036 [P] Code cleanup and refactoring to ensure adherence to project constitution (UI components without business logic, hooks with clear responsibilities)
- [ ] T037 Run manual validation following quickstart.md checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 completion (extends create functionality with edit/delete)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Verifies existing de-para integration, minimal dependencies

### Within Each User Story

**User Story 1**:
1. Hooks first (T008, T009 in parallel)
2. Modify existing hook (T010) after T008 complete
3. Components in parallel (T011, T012, T013 in parallel)
4. Container component (T014) after T011-T013
5. Integration (T015, T016, T017 sequentially)

**User Story 2**:
1. Component modifications (T018, T019, T020 can be parallel)
2. Container update (T021) after component changes
3. Hook logic (T022) in parallel with components
4. Final integration (T023)

**User Story 3**:
1. All verification tasks (T024-T028) can run in parallel as they verify existing integration

### Parallel Opportunities

- **Phase 1**: T002 and T003 can run in parallel
- **Phase 2**: T006 and T007 can run in parallel (different repositories)
- **Phase 3 (US1)**: 
  - T008 and T009 in parallel (different hooks)
  - T011, T012, T013 in parallel (different components)
- **Phase 4 (US2)**: T018, T019, T020, T022 can run in parallel (different files)
- **Phase 5 (US3)**: T024, T025, T026, T027, T028 can run in parallel (verification tasks)
- **Phase 6**: T029, T030, T031, T032, T036 can run in parallel (different files)

---

## Parallel Example: User Story 1

```bash
# Launch hooks together:
Task T008: "Implement useExportProfiles hook in hooks/useExportProfiles.ts"
Task T009: "Implement useActiveProfile hook in hooks/useActiveProfile.ts"

# Launch components together:
Task T011: "Create ProfileForm component in app/components/ProfileForm.tsx"
Task T012: "Create ProfileList component in app/components/ProfileList.tsx"
Task T013: "Create ProfileSelector component in app/components/ProfileSelector.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007) - CRITICAL
3. Complete Phase 3: User Story 1 (T008-T017)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Create profile "Cliente A" with column 5 and 2 projects
   - Select profile and verify export uses only those projects
   - Verify persistence after page reload
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
   - Users can create and use profiles
3. Add User Story 2 → Test independently → Deploy/Demo
   - Users can edit and delete profiles
4. Add User Story 3 → Test independently → Deploy/Demo
   - Verify de-para global integration
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T007)
2. Once Foundational is done:
   - Developer A: User Story 1 (T008-T017)
   - Developer B: Can start User Story 3 verification (T024-T028) in parallel
   - User Story 2 waits for User Story 1 completion
3. Stories complete and integrate independently

---

## Task Count Summary

- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 4 tasks
- **Phase 3 (US1 - MVP)**: 10 tasks
- **Phase 4 (US2)**: 6 tasks
- **Phase 5 (US3)**: 5 tasks
- **Phase 6 (Polish)**: 9 tasks

**Total**: 37 tasks

**Parallel Opportunities**: 18 tasks marked [P] can run in parallel within their phase

**Critical Path**: Setup → Foundational → US1 → US2 → Polish (minimum ~27 tasks if US3 skipped)

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Tests were NOT included as they were not requested in the specification
- Focus on clean separation: UI components receive props, hooks contain logic, repositories handle persistence
- Validate constitution adherence throughout: no business logic in components, testable hooks, layered architecture
