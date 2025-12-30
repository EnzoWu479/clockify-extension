# Quickstart: Configuração de Perfis de Exportação

**Feature**: 001-profile-configuration  
**Date**: 2024-12-30  
**For**: Desenvolvedores implementando esta feature

## Visão Geral

Este guia fornece um passo a passo para implementar o sistema de perfis de exportação, seguindo a arquitetura em camadas do projeto.

## Pré-requisitos

- Node.js 20+ instalado
- Projeto clonado e dependências instaladas (`npm install`)
- Familiaridade com Next.js App Router, React Hooks, e IndexedDB
- Leitura de `spec.md`, `research.md`, e `data-model.md`

## Ordem de Implementação

### Fase 1: Domínio e Infraestrutura (Foundation)

#### 1.1. Criar Tipos de Domínio

**Arquivo**: `src/domain/export-profile.ts`

```typescript
// Copiar definições de data-model.md
export type ExportProfile = { /* ... */ };
export type ActiveProfile = { /* ... */ };
export interface ExportProfileRepository { /* ... */ };
export interface ActiveProfileRepository { /* ... */ };
```

**Validação**: TypeScript compila sem erros

---

#### 1.2. Atualizar IndexedDB Client

**Arquivo**: `src/infra/db/indexeddb/indexeddb-client.ts`

**Mudanças**:
1. Incrementar `DB_VERSION` de 1 para 2
2. Adicionar constantes de stores:
   ```typescript
   export const EXPORT_PROFILES_STORE = "exportProfiles";
   export const ACTIVE_PROFILE_STORE = "activeProfile";
   ```
3. Adicionar lógica de migração no `onupgradeneeded`

**Validação**: 
- Abrir aplicação no navegador
- Inspecionar IndexedDB no DevTools
- Verificar 3 stores: `projectMappings`, `exportProfiles`, `activeProfile`

---

#### 1.3. Implementar ExportProfileRepository

**Arquivo**: `src/infra/db/indexeddb/export-profile-indexeddb-repository.ts`

**Padrão**: Seguir estrutura de `project-mapping-indexeddb-repository.ts`

**Métodos**:
- `listAll()`: `store.getAll()` + ordenar por nome
- `findById(id)`: `store.get(id)`
- `findByName(name)`: `listAll()` + filtrar case-insensitive
- `create(profile)`: `store.add(profile)`
- `update(profile)`: `store.put(profile)`
- `delete(id)`: `store.delete(id)`

**Validação**: Escrever testes unitários (Vitest + fake-indexeddb)

---

#### 1.4. Implementar ActiveProfileRepository

**Arquivo**: `src/infra/db/indexeddb/active-profile-indexeddb-repository.ts`

**Métodos**:
- `get()`: `store.get('current')` || `{ key: 'current', profileId: null }`
- `set(profileId)`: `store.put({ key: 'current', profileId })`
- `clear()`: `set(null)`

**Validação**: Testes unitários

---

### Fase 2: Hooks (Business Logic)

#### 2.1. Implementar useExportProfiles

**Arquivo**: `hooks/useExportProfiles.ts`

**Estado**:
```typescript
const [profiles, setProfiles] = useState<ExportProfile[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<ProfileError | null>(null);
```

**Funções**:
- `createProfile(data)`: Validar → gerar UUID → criar → atualizar estado
- `updateProfile(id, data)`: Validar → atualizar → atualizar estado
- `deleteProfile(id)`: Verificar se ativo → deletar → atualizar estado
- `findProfileByName(name)`: Buscar em `profiles` (case-insensitive)

**Validações**:
- Nome: 3-100 chars, único
- Coluna: 3-20
- Projetos: array não vazio

**Validação**: Testes de hook com @testing-library/react

---

#### 2.2. Implementar useActiveProfile

**Arquivo**: `hooks/useActiveProfile.ts`

**Estado**:
```typescript
const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(true);
```

**Funções**:
- `setActiveProfile(profileId)`: Persistir → atualizar estado
- `clearActiveProfile()`: Persistir null → atualizar estado
- `getActiveProfile()`: Buscar perfil completo (join com useExportProfiles)

**Validação**: Testes de hook

---

#### 2.3. Modificar useClockifyExportText

**Arquivo**: `hooks/useClockifyExportText.ts`

**Mudança**: Adicionar parâmetro opcional `allowedProjectNames?: string[]`

**Lógica**:
```typescript
let entries = groupedEntries;

if (allowedProjectNames && allowedProjectNames.length > 0) {
  entries = entries.filter(entry => 
    allowedProjectNames.includes(entry.projectName ?? '')
  );
}

// ... resto da lógica existente
```

**Validação**: 
- Testes existentes continuam passando
- Novos testes com filtro

---

### Fase 3: Componentes UI

#### 3.1. Criar ProfileForm

**Arquivo**: `app/components/ProfileForm.tsx`

**Props**:
```typescript
type ProfileFormProps = {
  mode: 'create' | 'edit';
  initialData?: Partial<ExportProfile>;
  availableProjects: string[];
  onSubmit: (data: ProfileFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error?: string;
};
```

**Campos**:
- Input: Nome do perfil
- Number input: Coluna de horas (3-20)
- Checkboxes: Seleção de projetos

**Validação**: Validação em tempo real, feedback visual

---

#### 3.2. Criar ProfileList

**Arquivo**: `app/components/ProfileList.tsx`

**Props**:
```typescript
type ProfileListProps = {
  profiles: ExportProfile[];
  activeProfileId: string | null;
  onEdit: (profile: ExportProfile) => void;
  onDelete: (profile: ExportProfile) => void;
  onActivate: (profileId: string) => void;
};
```

**UI**:
- Lista de perfis com nome, projetos count, coluna
- Indicador visual de perfil ativo
- Botões: Editar, Excluir, Ativar
- Confirmação antes de excluir

---

#### 3.3. Criar ProfileSelector

**Arquivo**: `app/components/ProfileSelector.tsx`

**Props**:
```typescript
type ProfileSelectorProps = {
  profiles: ExportProfile[];
  activeProfileId: string | null;
  onSelect: (profileId: string | null) => void;
};
```

**UI**:
- Dropdown/Select com lista de perfis
- Opção "Nenhum (padrão)" para null
- Indicador visual do selecionado

---

#### 3.4. Criar ProfileManager

**Arquivo**: `app/components/ProfileManager.tsx`

**Responsabilidade**: Container que compõe ProfileList + ProfileForm + ProfileSelector

**Estado local**:
- Modal aberto/fechado
- Modo (criar/editar)
- Perfil sendo editado

**Integração**: Usa hooks `useExportProfiles` e `useActiveProfile`

---

#### 3.5. Modificar ExportSettings

**Arquivo**: `app/components/ExportSettings.tsx`

**Mudança**: Adicionar seção de gerenciamento de perfis

```tsx
{show && (
  <div className="mt-3 space-y-3">
    {/* Seção existente: coluna de horas */}
    
    {/* [NEW] Seção de perfis */}
    <ProfileManager
      projectNames={projectNames}
      activeProfileId={activeProfileId}
      onActiveProfileChange={setActiveProfile}
    />
    
    {/* Seção existente: de-para global */}
  </div>
)}
```

---

#### 3.6. Modificar DaySummaryHeader

**Arquivo**: `app/components/DaySummaryHeader.tsx`

**Mudança**: Mostrar nome do perfil ativo

```tsx
<div className="flex items-center gap-3">
  <span>This week</span>
  {activeProfile && (
    <span className="text-xs text-purple-400">
      Perfil: {activeProfile.name}
    </span>
  )}
  <span className="text-xs text-slate-400">
    Total do dia: {totalLabel}
  </span>
</div>
```

---

#### 3.7. Modificar page.tsx

**Arquivo**: `app/page.tsx`

**Mudanças**:
1. Adicionar hooks:
   ```typescript
   const { profiles, createProfile, updateProfile, deleteProfile } = useExportProfiles();
   const { activeProfileId, setActiveProfile } = useActiveProfile();
   ```

2. Modificar chamada de `useClockifyExportText`:
   ```typescript
   const activeProfile = profiles.find(p => p.id === activeProfileId);
   
   const { exportText } = useClockifyExportText({
     groupedEntries,
     hoursColumnIndex: activeProfile?.hoursColumnIndex ?? hoursColumnIndex,
     getExcelValueForProjectName,
     allowedProjectNames: activeProfile?.projectNames,
   });
   ```

3. Passar props para componentes modificados

---

### Fase 4: Testes

#### 4.1. Configurar Vitest

**Arquivos**:
- `vitest.config.ts`
- `vitest.setup.ts`

**Dependências**:
```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom fake-indexeddb
```

---

#### 4.2. Testes Unitários

**Arquivos**:
- `tests/unit/export-profile-repository.test.ts`
- `tests/unit/active-profile-repository.test.ts`
- `tests/unit/useExportProfiles.test.ts`
- `tests/unit/useActiveProfile.test.ts`

**Cobertura mínima**: 80% de linhas

---

#### 4.3. Testes de Integração

**Arquivo**: `tests/integration/profile-export-flow.test.ts`

**Cenários**:
1. Criar perfil → ativar → exportar (verificar filtro aplicado)
2. Editar perfil ativo → exportar (verificar mudanças)
3. Excluir perfil ativo → exportar (verificar volta ao padrão)
4. Alternar entre perfis → exportar (verificar cada configuração)

---

### Fase 5: Validação Final

#### 5.1. Checklist de Funcionalidade

- [ ] Criar perfil com nome, coluna, projetos
- [ ] Editar perfil existente
- [ ] Excluir perfil (com confirmação)
- [ ] Selecionar perfil ativo
- [ ] Desativar perfil (voltar ao padrão)
- [ ] Exportar com perfil ativo (filtro + coluna aplicados)
- [ ] Exportar sem perfil (comportamento original)
- [ ] De-para global aplicado em todos os perfis
- [ ] Validações funcionando (nome duplicado, coluna inválida, etc.)
- [ ] Persistência entre sessões

---

#### 5.2. Checklist de Qualidade

- [ ] Todos os testes passando
- [ ] Sem erros no console
- [ ] Sem warnings de TypeScript
- [ ] Código segue constituição do projeto
- [ ] Componentes sem lógica de negócio
- [ ] Hooks testáveis isoladamente
- [ ] Arquitetura em camadas respeitada
- [ ] Acessibilidade (labels, ARIA, keyboard nav)
- [ ] Feedback visual (loading, errors, success)

---

#### 5.3. Checklist de Performance

- [ ] Carregamento de perfis < 100ms
- [ ] Alternância entre perfis < 50ms
- [ ] Operações CRUD < 200ms
- [ ] Sem re-renders desnecessários
- [ ] Memoização adequada (useMemo, useCallback)

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Testes
npm run test              # Rodar todos os testes
npm run test:watch        # Modo watch
npm run test:ui           # Interface visual (Vitest UI)
npm run test:coverage     # Relatório de cobertura

# Lint
npm run lint

# Build
npm run build
```

---

## Troubleshooting

### IndexedDB não cria stores

**Problema**: Stores não aparecem no DevTools  
**Solução**: 
1. Limpar IndexedDB: DevTools → Application → IndexedDB → Delete
2. Recarregar página
3. Verificar `DB_VERSION` foi incrementado

---

### Testes de IndexedDB falhando

**Problema**: Erros relacionados a IndexedDB em testes  
**Solução**:
1. Verificar `fake-indexeddb` está importado no setup
2. Limpar banco entre testes: `afterEach(() => indexedDB.deleteDatabase('clockify-extension'))`

---

### Perfil ativo não persiste

**Problema**: Perfil ativo reseta ao recarregar  
**Solução**:
1. Verificar `ActiveProfileRepository.set()` está sendo chamado
2. Verificar store `activeProfile` existe no IndexedDB
3. Verificar `useActiveProfile` carrega no mount

---

### Filtro de projetos não funciona

**Problema**: Todos os projetos aparecem mesmo com perfil ativo  
**Solução**:
1. Verificar `allowedProjectNames` está sendo passado para `useClockifyExportText`
2. Verificar nomes dos projetos são exatamente iguais (case-sensitive)
3. Verificar lógica de filtro no hook

---

## Próximos Passos

Após implementação completa:

1. **Code Review**: Solicitar revisão seguindo checklist de qualidade
2. **Testing**: QA manual de todos os cenários
3. **Documentation**: Atualizar README se necessário
4. **Deployment**: Merge para branch principal
5. **Monitoring**: Observar erros em produção (se aplicável)

---

## Recursos Adicionais

- **Spec**: `spec.md` - Requisitos funcionais
- **Research**: `research.md` - Decisões técnicas
- **Data Model**: `data-model.md` - Estruturas de dados
- **Plan**: `plan.md` - Plano de implementação completo
- **Constituição**: `.specify/memory/constitution.md` - Princípios arquiteturais

---

## Estimativa de Tempo

| Fase | Estimativa | Prioridade |
|------|-----------|-----------|
| Fase 1: Domínio/Infra | 4-6 horas | P1 |
| Fase 2: Hooks | 4-6 horas | P1 |
| Fase 3: UI | 6-8 horas | P1 |
| Fase 4: Testes | 4-6 horas | P2 |
| Fase 5: Validação | 2-3 horas | P2 |
| **Total** | **20-29 horas** | - |

**Nota**: Estimativas para desenvolvedor familiarizado com a stack. Ajustar conforme experiência.

---

## Contato

Para dúvidas sobre esta feature, consultar:
- Especificação completa em `specs/001-profile-configuration/`
- Constituição do projeto em `.specify/memory/constitution.md`
- Código existente similar: `ProjectMapping` (referência de padrão)
