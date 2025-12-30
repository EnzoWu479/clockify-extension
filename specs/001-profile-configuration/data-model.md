# Data Model: Configuração de Perfis de Exportação

**Feature**: 001-profile-configuration  
**Date**: 2024-12-30  
**Status**: Complete

## Overview

Este documento define o modelo de dados para o sistema de perfis de exportação. O modelo segue a arquitetura em camadas do projeto, com tipos de domínio, interfaces de repositório, e estruturas de persistência em IndexedDB.

## Domain Entities

### ExportProfile

Representa uma configuração nomeada de exportação com coluna de horas e projetos selecionados.

```typescript
export type ExportProfile = {
  id: string;                    // UUID v4 gerado na criação
  name: string;                  // Nome do perfil (3-100 caracteres)
  hoursColumnIndex: number;      // Coluna de horas no Excel (3-20)
  projectNames: string[];        // Lista de nomes de projetos do Clockify
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
};
```

**Validations**:
- `id`: Não vazio, formato UUID
- `name`: 3-100 caracteres, não vazio após trim
- `hoursColumnIndex`: Inteiro entre 3 e 20 (inclusive)
- `projectNames`: Array não vazio, cada item não vazio após trim
- `createdAt`: ISO 8601 válido
- `updatedAt`: ISO 8601 válido, >= createdAt

**Business Rules**:
- Nomes de perfis devem ser únicos (case-insensitive)
- `updatedAt` deve ser atualizado em qualquer modificação
- `projectNames` armazena nomes exatos como retornados pela API Clockify
- Ordem de `projectNames` não é significativa

---

### ActiveProfile

Representa a referência ao perfil atualmente selecionado pelo usuário.

```typescript
export type ActiveProfile = {
  key: 'current';                // Chave fixa para registro único
  profileId: string | null;      // ID do perfil ativo, ou null se nenhum
};
```

**Validations**:
- `key`: Sempre `'current'` (literal type)
- `profileId`: UUID válido ou `null`

**Business Rules**:
- Apenas um registro deve existir na store
- `null` significa "nenhum perfil ativo" (usar comportamento padrão)
- Se `profileId` referencia perfil inexistente, deve ser tratado como `null`

---

### ProjectMapping (Existing)

Mapeamento global entre nomes de projetos Clockify e valores de exportação Excel. **Sem modificações**.

```typescript
export type ProjectMapping = {
  id: string;                    // Nome do projeto normalizado (lowercase)
  clockifyProjectName: string;   // Nome original do projeto no Clockify
  excelValue: string;            // Valor a ser exportado no Excel
};
```

**Nota**: Esta entidade já existe no projeto e não será modificada. É usada globalmente por todos os perfis.

---

## Repository Interfaces

### ExportProfileRepository

Interface para operações CRUD de perfis de exportação.

```typescript
export interface ExportProfileRepository {
  /**
   * Lista todos os perfis ordenados por nome (alfabético, pt-BR)
   */
  listAll(): Promise<ExportProfile[]>;
  
  /**
   * Busca perfil por ID
   * @returns Perfil encontrado ou undefined
   */
  findById(id: string): Promise<ExportProfile | undefined>;
  
  /**
   * Busca perfil por nome (case-insensitive)
   * @returns Perfil encontrado ou undefined
   */
  findByName(name: string): Promise<ExportProfile | undefined>;
  
  /**
   * Cria novo perfil
   * @throws Se nome já existe (case-insensitive)
   */
  create(profile: ExportProfile): Promise<void>;
  
  /**
   * Atualiza perfil existente
   * @throws Se ID não existe
   * @throws Se novo nome conflita com outro perfil
   */
  update(profile: ExportProfile): Promise<void>;
  
  /**
   * Exclui perfil por ID
   * @throws Se ID não existe
   */
  delete(id: string): Promise<void>;
}
```

---

### ActiveProfileRepository

Interface para gerenciar o perfil atualmente ativo.

```typescript
export interface ActiveProfileRepository {
  /**
   * Obtém o perfil ativo atual
   * @returns ActiveProfile com profileId ou null se nenhum ativo
   */
  get(): Promise<ActiveProfile>;
  
  /**
   * Define o perfil ativo
   * @param profileId ID do perfil a ativar, ou null para desativar
   */
  set(profileId: string | null): Promise<void>;
  
  /**
   * Remove a seleção de perfil ativo (equivalente a set(null))
   */
  clear(): Promise<void>;
}
```

---

## IndexedDB Schema

### Database Configuration

```typescript
const DB_NAME = "clockify-extension";
const DB_VERSION = 2;  // Incrementado de 1 para 2

// Store names
export const PROJECT_MAPPINGS_STORE = "projectMappings";     // Existing
export const EXPORT_PROFILES_STORE = "exportProfiles";       // New
export const ACTIVE_PROFILE_STORE = "activeProfile";         // New
```

### Store Schemas

#### exportProfiles Store

```typescript
{
  keyPath: "id",
  autoIncrement: false,
  indexes: [] // Sem índices adicionais
}
```

**Records**: Array de `ExportProfile`

**Queries**:
- Por ID: `store.get(id)`
- Todos: `store.getAll()` → ordenar em memória
- Por nome: `store.getAll()` → filtrar em memória (case-insensitive)

---

#### activeProfile Store

```typescript
{
  keyPath: "key",
  autoIncrement: false,
  indexes: [] // Sem índices adicionais
}
```

**Records**: Registro único `ActiveProfile`

**Queries**:
- Obter ativo: `store.get('current')`
- Definir ativo: `store.put({ key: 'current', profileId })`

---

#### projectMappings Store (Existing)

**Sem modificações**. Continua com schema atual.

---

## Migration Strategy

### Version 1 → Version 2

```typescript
request.onupgradeneeded = (event) => {
  const db = request.result;
  const oldVersion = event.oldVersion;
  
  // V1: projectMappings store
  if (oldVersion < 1) {
    if (!db.objectStoreNames.contains(PROJECT_MAPPINGS_STORE)) {
      db.createObjectStore(PROJECT_MAPPINGS_STORE, { keyPath: "id" });
    }
  }
  
  // V2: exportProfiles e activeProfile stores
  if (oldVersion < 2) {
    if (!db.objectStoreNames.contains(EXPORT_PROFILES_STORE)) {
      db.createObjectStore(EXPORT_PROFILES_STORE, { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains(ACTIVE_PROFILE_STORE)) {
      db.createObjectStore(ACTIVE_PROFILE_STORE, { keyPath: "key" });
    }
  }
};
```

**Notas**:
- Migração é automática ao abrir banco com versão superior
- Dados existentes em `projectMappings` são preservados
- Novas stores começam vazias
- Usuários existentes não perdem configurações de de-para

---

## State Transitions

### ExportProfile Lifecycle

```
[Não existe]
    ↓ create()
[Criado] ← update() → [Atualizado]
    ↓ delete()
[Excluído]
```

**Regras**:
- Criação: Gerar UUID, timestamps, validar unicidade de nome
- Atualização: Validar ID existe, atualizar `updatedAt`, validar nome se mudou
- Exclusão: Verificar se é perfil ativo, desativar se necessário

---

### ActiveProfile State

```
[null] ← set(null) / clear()
  ↕ set(profileId)
[profileId]
```

**Regras**:
- Sempre existe um registro (inicializado com `null` se não existir)
- `set(null)` e `clear()` são equivalentes
- `set(profileId)` não valida se perfil existe (validação no hook)

---

## Relationships

```
┌─────────────────┐
│ ExportProfile   │
│ - id            │
│ - name          │
│ - projectNames[]│ ──┐
└─────────────────┘   │
         ↑            │
         │            │
    references        │ references (by name)
         │            │
┌─────────────────┐   │   ┌──────────────────┐
│ ActiveProfile   │   └──→│ ProjectMapping   │
│ - profileId     │       │ - clockifyName   │
└─────────────────┘       │ - excelValue     │
                          └──────────────────┘
```

**Relacionamentos**:
1. `ActiveProfile.profileId` → `ExportProfile.id` (opcional, pode ser null)
2. `ExportProfile.projectNames[]` → `ProjectMapping.clockifyProjectName` (lookup para de-para)

**Integridade Referencial**:
- Não há foreign keys no IndexedDB
- Validação de referências é responsabilidade dos hooks
- Perfil ativo com ID inválido é tratado como `null`
- Projetos sem de-para usam nome original

---

## Data Flow

### Criação de Perfil

```
User Input (form)
    ↓
Validation (hook)
    ↓
Generate UUID + timestamps
    ↓
Check name uniqueness (hook)
    ↓
ExportProfileRepository.create()
    ↓
IndexedDB.put()
    ↓
Update local state (hook)
    ↓
UI refresh
```

---

### Seleção de Perfil Ativo

```
User selects profile
    ↓
ActiveProfileRepository.set(profileId)
    ↓
IndexedDB.put({ key: 'current', profileId })
    ↓
Update local state (hook)
    ↓
Trigger export text regeneration
    ↓
UI refresh (show active profile, filtered export)
```

---

### Exportação com Perfil

```
User clicks "Copiar para Planilha Projeto"
    ↓
Get active profile (hook)
    ↓
If profile: filter projects by profile.projectNames
    ↓
If profile: use profile.hoursColumnIndex
    ↓
Apply global de-para (ProjectMapping)
    ↓
Generate export text
    ↓
Copy to clipboard
```

---

## Validation Rules Summary

### ExportProfile

| Campo | Regra | Mensagem de Erro |
|-------|-------|------------------|
| `name` | 3-100 chars, não vazio | "Nome deve ter entre 3 e 100 caracteres" |
| `name` | Único (case-insensitive) | "Perfil com nome '[nome]' já existe" |
| `hoursColumnIndex` | 3-20 (inteiro) | "Coluna deve estar entre 3 e 20" |
| `projectNames` | Array não vazio | "Selecione pelo menos um projeto" |
| `projectNames[]` | Cada item não vazio | "Nome de projeto inválido" |

### ActiveProfile

| Campo | Regra | Mensagem de Erro |
|-------|-------|------------------|
| `profileId` | UUID válido ou null | "ID de perfil inválido" |
| `profileId` | Perfil existe (warning) | "Perfil não encontrado, usando padrão" |

---

## Performance Considerations

### Indexing Strategy

**Decisão**: Não criar índices adicionais

**Rationale**:
- Volume de dados pequeno (~10-50 perfis)
- Queries simples (getAll + filtro em memória)
- Overhead de manutenção de índices não justifica benefício
- Ordenação e filtros em memória são rápidos para este volume

### Caching Strategy

**Decisão**: Cache em memória no hook

**Implementação**:
- Hook mantém array de perfis em `useState`
- Carrega uma vez no mount
- Atualiza cache após cada operação CRUD
- Não recarrega do banco desnecessariamente

**Benefícios**:
- Operações de leitura instantâneas
- Reduz chamadas ao IndexedDB
- Simplifica lógica de validação (dados já em memória)

---

## Error Handling

### Repository Errors

```typescript
// Erro de duplicata
class DuplicateProfileNameError extends Error {
  constructor(name: string) {
    super(`Perfil com nome "${name}" já existe`);
    this.name = 'DuplicateProfileNameError';
  }
}

// Erro de não encontrado
class ProfileNotFoundError extends Error {
  constructor(id: string) {
    super(`Perfil com ID "${id}" não encontrado`);
    this.name = 'ProfileNotFoundError';
  }
}

// Erro de IndexedDB
class StorageError extends Error {
  constructor(operation: string, cause?: Error) {
    super(`Erro ao ${operation}: ${cause?.message || 'desconhecido'}`);
    this.name = 'StorageError';
    this.cause = cause;
  }
}
```

### Hook Error States

```typescript
type ProfileError = {
  type: 'validation' | 'storage' | 'not_found' | 'duplicate';
  message: string;
  field?: string; // Para erros de validação
};
```

---

## Testing Strategy

### Unit Tests (Repository)

```typescript
describe('ExportProfileRepository', () => {
  // Setup: fake-indexeddb
  
  test('create: salva perfil com sucesso');
  test('create: rejeita nome duplicado');
  test('findById: retorna perfil existente');
  test('findById: retorna undefined para ID inexistente');
  test('findByName: busca case-insensitive');
  test('update: atualiza perfil existente');
  test('update: rejeita se ID não existe');
  test('delete: remove perfil');
  test('listAll: retorna ordenado por nome');
});

describe('ActiveProfileRepository', () => {
  test('get: retorna null se não existe registro');
  test('set: cria registro se não existe');
  test('set: atualiza registro existente');
  test('clear: define como null');
});
```

### Integration Tests (Hooks)

```typescript
describe('useExportProfiles', () => {
  test('carrega perfis na montagem');
  test('cria perfil e atualiza lista');
  test('valida nome duplicado antes de criar');
  test('atualiza perfil e reflete na lista');
  test('exclui perfil e remove da lista');
  test('exclui perfil ativo e desativa automaticamente');
});

describe('useActiveProfile', () => {
  test('inicia com null se nenhum ativo');
  test('ativa perfil e persiste');
  test('desativa perfil');
  test('trata perfil ativo inexistente como null');
});
```

---

## Summary

O modelo de dados foi projetado para:

✅ **Simplicidade**: Estruturas planas, sem relacionamentos complexos  
✅ **Consistência**: Segue padrões existentes do projeto (ProjectMapping)  
✅ **Validação**: Regras claras em cada camada  
✅ **Performance**: Cache em memória, queries otimizadas  
✅ **Testabilidade**: Interfaces bem definidas, fácil de mockar  
✅ **Manutenibilidade**: Migração versionada, backward compatible

Próximo passo: Definir contratos de API (não aplicável, projeto é client-side) e criar quickstart.md.
