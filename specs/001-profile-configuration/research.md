# Research: Configuração de Perfis de Exportação

**Feature**: 001-profile-configuration  
**Date**: 2024-12-30  
**Status**: Complete

## Overview

Este documento consolida as decisões técnicas e pesquisas realizadas para implementar o sistema de perfis de exportação. O objetivo é resolver todas as clarificações identificadas no Technical Context e estabelecer padrões de implementação.

## Research Items

### 1. Framework de Testes (NEEDS CLARIFICATION)

**Contexto**: O projeto não possui framework de testes configurado no `package.json`. Necessário definir solução para garantir testabilidade (Princípio III da constituição).

**Opções Avaliadas**:

| Framework | Prós | Contras | Adequação |
|-----------|------|---------|-----------|
| **Jest** | Padrão do ecossistema React, ampla documentação, suporte a mocks de IndexedDB via `fake-indexeddb` | Configuração mais complexa com Next.js App Router, pode ter conflitos com ESM | ⭐⭐⭐ Bom |
| **Vitest** | Nativo para ESM, rápido, compatível com API do Jest, melhor integração com projetos modernos | Menos maduro que Jest, documentação menor | ⭐⭐⭐⭐ Excelente |
| **Testing Library** | Focado em testes de componentes React, boas práticas de teste de UI | Não é framework completo (precisa de Jest/Vitest), não testa hooks isoladamente sem wrapper | ⭐⭐ Complementar |

**Decisão**: **Vitest + @testing-library/react**

**Rationale**:
- Vitest é mais adequado para projetos Next.js modernos com TypeScript e ESM
- Melhor performance que Jest (até 10x mais rápido em alguns casos)
- API compatível com Jest, facilitando migração futura se necessário
- Suporte nativo a TypeScript sem configurações complexas
- Testing Library para testes de componentes React (boas práticas)
- Para hooks: `@testing-library/react-hooks` ou testar via componente wrapper

**Implementação**:
```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom fake-indexeddb
```

**Configuração mínima** (`vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

---

### 2. Padrões de IndexedDB para Múltiplas Stores

**Contexto**: Atualmente o projeto tem uma store (`projectMappings`). Precisamos adicionar duas novas: `exportProfiles` e `activeProfile`.

**Pesquisa**: Melhores práticas para gerenciar múltiplas stores em IndexedDB

**Padrões Identificados**:

1. **Versionamento de Schema**: Incrementar `DB_VERSION` ao adicionar novas stores
2. **Migração Segura**: Verificar existência de stores antes de criar
3. **Transações Isoladas**: Cada operação deve usar transação específica para sua store
4. **Separação de Concerns**: Um repositório por entidade/store

**Decisão**: Seguir padrão existente do projeto

**Implementação**:
- Modificar `indexeddb-client.ts` para versão 2
- Adicionar stores `exportProfiles` (keyPath: `id`) e `activeProfile` (keyPath: `key`, valor fixo: `'current'`)
- Criar repositórios separados seguindo padrão de `ProjectMappingIndexedDbRepository`

**Código de referência** (modificação em `indexeddb-client.ts`):
```typescript
const DB_VERSION = 2; // Incrementar de 1 para 2

export const EXPORT_PROFILES_STORE = "exportProfiles";
export const ACTIVE_PROFILE_STORE = "activeProfile";

request.onupgradeneeded = (event) => {
  const db = request.result;
  const oldVersion = event.oldVersion;
  
  // Migração v1 -> v2
  if (oldVersion < 1) {
    if (!db.objectStoreNames.contains(PROJECT_MAPPINGS_STORE)) {
      db.createObjectStore(PROJECT_MAPPINGS_STORE, { keyPath: "id" });
    }
  }
  
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

---

### 3. Estratégia de Filtro de Projetos na Exportação

**Contexto**: A funcionalidade `useClockifyExportText` precisa filtrar projetos baseado no perfil ativo.

**Opções Avaliadas**:

| Abordagem | Descrição | Prós | Contras |
|-----------|-----------|------|---------|
| **Filtro no Hook** | `useClockifyExportText` recebe lista de project names permitidos e filtra `groupedEntries` | Simples, mantém lógica no hook | Hook fica acoplado a conceito de perfil |
| **Filtro no Componente** | Componente filtra `groupedEntries` antes de passar para hook | Hook permanece genérico | Lógica de filtro vaza para UI |
| **Hook Composto** | Novo hook `useProfiledExportText` que compõe `useClockifyExportText` + filtro | Separação de responsabilidades clara | Adiciona camada extra |

**Decisão**: **Filtro no Hook com parâmetro opcional**

**Rationale**:
- Mantém lógica de exportação centralizada
- Parâmetro opcional `allowedProjectNames?: string[]` mantém compatibilidade
- Se não fornecido, exporta todos os projetos (comportamento atual)
- Se fornecido, filtra antes de gerar texto

**Implementação**:
```typescript
export function useClockifyExportText({
  groupedEntries,
  hoursColumnIndex,
  getExcelValueForProjectName,
  allowedProjectNames, // [NEW] opcional
}: UseClockifyExportTextParams) {
  const exportText = useMemo(() => {
    let entries = groupedEntries;
    
    // Filtrar por perfil se especificado
    if (allowedProjectNames && allowedProjectNames.length > 0) {
      entries = entries.filter(entry => 
        allowedProjectNames.includes(entry.projectName ?? '')
      );
    }
    
    // ... resto da lógica existente
  }, [groupedEntries, hoursColumnIndex, getExcelValueForProjectName, allowedProjectNames]);
}
```

---

### 4. Gerenciamento de Perfil Ativo

**Contexto**: Necessário decidir como armazenar e gerenciar qual perfil está atualmente ativo.

**Opções Avaliadas**:

| Abordagem | Descrição | Prós | Contras |
|-----------|-----------|------|---------|
| **localStorage** | Armazenar ID do perfil ativo em `localStorage` | Simples, rápido | Inconsistente com resto do projeto (usa IndexedDB) |
| **IndexedDB (store separada)** | Store `activeProfile` com registro único | Consistente com arquitetura, transacional | Ligeiramente mais complexo |
| **Estado em memória** | Apenas React state, sem persistência | Muito simples | Perde seleção ao recarregar página |

**Decisão**: **IndexedDB com store separada**

**Rationale**:
- Consistência com arquitetura existente (todo estado persistente em IndexedDB)
- Permite transações atômicas (trocar perfil ativo + validar existência)
- Suporta cenários futuros (ex: histórico de perfis usados)
- Store simples com um único registro: `{ key: 'current', profileId: 'abc123' | null }`

**Implementação**:
- Store: `activeProfile` com keyPath `key`
- Registro único: `{ key: 'current', profileId: string | null }`
- `null` significa "nenhum perfil ativo" (usar comportamento padrão)

---

### 5. Validação de Nomes de Perfis Duplicados

**Contexto**: FR-017 exige prevenção de nomes duplicados. Necessário definir estratégia de validação.

**Opções Avaliadas**:

| Abordagem | Descrição | Prós | Contras |
|-----------|-----------|------|---------|
| **Validação no Hook** | Hook verifica duplicatas antes de salvar | Centralizado, reutilizável | Hook precisa carregar todos os perfis |
| **Validação no Repositório** | Repositório rejeita se nome existe | Camada correta (infra) | Repositório fica mais complexo |
| **Índice Único no IndexedDB** | Criar índice único no campo `name` | Garantia no banco | IndexedDB não suporta índices únicos nativamente |

**Decisão**: **Validação no Hook com normalização**

**Rationale**:
- Hook já carrega lista de perfis em memória (para exibição)
- Validação antes de chamar repositório evita operação desnecessária
- Normalização case-insensitive: "Cliente A" === "cliente a" === "CLIENTE A"
- Mensagem de erro clara para o usuário

**Implementação**:
```typescript
async function createProfile(data: CreateProfileData) {
  const normalizedName = data.name.trim().toLowerCase();
  const exists = profiles.some(p => 
    p.name.trim().toLowerCase() === normalizedName
  );
  
  if (exists) {
    throw new Error(`Perfil com nome "${data.name}" já existe`);
  }
  
  // ... criar perfil
}
```

---

### 6. Comportamento ao Excluir Perfil Ativo

**Contexto**: Edge case identificado na spec - o que acontece quando o perfil atualmente ativo é excluído?

**Opções Avaliadas**:

| Abordagem | Descrição | Impacto UX |
|-----------|-----------|------------|
| **Desativar automaticamente** | Setar `activeProfile` para `null` | Usuário perde seleção, volta ao padrão |
| **Bloquear exclusão** | Não permitir excluir perfil ativo | Usuário precisa trocar antes de excluir |
| **Selecionar outro automaticamente** | Ativar primeiro perfil da lista | Comportamento inesperado |

**Decisão**: **Desativar automaticamente com notificação**

**Rationale**:
- Mais seguro que bloquear (usuário pode querer limpar tudo)
- Mais previsível que auto-selecionar outro
- Notificação clara: "Perfil [nome] excluído. Usando configuração padrão."
- Consistente com FR-016 (sistema deve funcionar sem perfil)

**Implementação**:
```typescript
async function deleteProfile(id: string) {
  const activeProfile = await activeProfileRepo.get();
  
  // Se estamos excluindo o perfil ativo, desativar primeiro
  if (activeProfile?.profileId === id) {
    await activeProfileRepo.set(null);
  }
  
  await profileRepo.delete(id);
  
  return { wasActive: activeProfile?.profileId === id };
}
```

---

## Best Practices Identified

### IndexedDB

1. **Sempre usar try-catch**: Operações IndexedDB podem falhar (quota, permissões)
2. **Transações curtas**: Abrir, executar, fechar rapidamente
3. **Verificar `typeof window`**: Hooks podem rodar no servidor (Next.js SSR)
4. **Cleanup em useEffect**: Prevenir memory leaks com flags `isMounted`

### React Hooks

1. **Separação de responsabilidades**: Um hook = uma intenção clara
2. **Memoização adequada**: `useMemo` para computações, `useCallback` para funções passadas como props
3. **Loading states**: Sempre expor `isLoading` para feedback ao usuário
4. **Error handling**: Expor erros para componentes decidirem como exibir

### Componentes React

1. **Props explícitas**: Evitar prop drilling com composição
2. **Controlled components**: Formulários controlados para validação em tempo real
3. **Acessibilidade**: Labels, ARIA attributes, keyboard navigation
4. **Feedback visual**: Loading spinners, disabled states, confirmações

---

## Dependencies to Add

```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "fake-indexeddb": "^5.0.0"
  }
}
```

---

## Alternatives Considered and Rejected

### Usar Context API para Estado Global
**Rejeitado porque**: Adiciona complexidade desnecessária. Hooks locais são suficientes para este caso de uso. Violaria Princípio V (simplicidade).

### Criar Abstração de Storage Genérica
**Rejeitado porque**: YAGNI (You Aren't Gonna Need It). Apenas IndexedDB é necessário. Abstração prematura violaria Princípio V.

### Usar Biblioteca de State Management (Zustand, Redux)
**Rejeitado porque**: Overkill para este caso. Estado é local e bem definido. Violaria Princípio V (simplicidade) e adicionaria dependência externa desnecessária.

### Normalizar Projetos por ID ao invés de Nome
**Rejeitado porque**: Projetos vêm da API Clockify sem IDs estáveis. Usar nomes é mais simples e suficiente para o caso de uso.

---

## Summary

Todas as clarificações técnicas foram resolvidas:

✅ **Framework de Testes**: Vitest + Testing Library  
✅ **IndexedDB Multi-Store**: Versionamento para v2, 3 stores totais  
✅ **Filtro de Projetos**: Parâmetro opcional no hook existente  
✅ **Perfil Ativo**: Store separada em IndexedDB  
✅ **Validação de Duplicatas**: No hook com normalização case-insensitive  
✅ **Exclusão de Perfil Ativo**: Desativar automaticamente com notificação

A implementação seguirá os padrões existentes do projeto, respeitando todos os princípios da constituição. Próximo passo: Phase 1 (data-model.md e contracts).
