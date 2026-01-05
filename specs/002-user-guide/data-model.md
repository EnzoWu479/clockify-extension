# Data Model: Guia Interativo do Usuário

**Feature**: 002-user-guide  
**Date**: 2024-12-30  
**Status**: Complete

## Overview

Este documento define o modelo de dados para o sistema de guia interativo e ajuda contextual. O modelo segue a arquitetura em camadas do projeto, com tipos de domínio e estruturas de persistência em localStorage.

## Domain Entities

### TourState

Representa o estado atual do tour do usuário.

```typescript
export type TourState = {
  tourCompleted: boolean;
  tourSkipped: boolean;
  currentStep: number;
  lastCompletedAt: string | null;
  version: string;
};
```

**Validations**:
- `tourCompleted`: Boolean
- `tourSkipped`: Boolean
- `currentStep`: Inteiro >= 0
- `lastCompletedAt`: ISO 8601 timestamp ou null
- `version`: String no formato semver (ex: "1.0.0")

**Business Rules**:
- Se `tourCompleted` é true, `currentStep` deve ser o último passo
- Se `tourSkipped` é true, `tourCompleted` deve ser false
- `lastCompletedAt` só é preenchido quando `tourCompleted` é true
- `version` é usada para invalidar tour em atualizações

---

### TourStep

Representa um passo individual do tour interativo.

```typescript
export type TourStep = {
  target: string;
  title: string;
  content: string;
  disableBeacon: boolean;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  spotlightClicks: boolean;
  action?: string;
};
```

**Validations**:
- `target`: CSS selector válido (ex: "#api-key-input")
- `title`: String não vazia (1-100 caracteres)
- `content`: String não vazia (1-500 caracteres)
- `disableBeacon`: Boolean
- `placement`: Enum de posições válidas
- `spotlightClicks`: Boolean
- `action`: String opcional descrevendo ação esperada

**Business Rules**:
- `target` deve corresponder a elemento existente no DOM
- `placement` é sugestão (biblioteca ajusta se não couber)
- `spotlightClicks` permite interação com elemento destacado
- `action` é usado para detectar conclusão automática do passo

---

### HelpContent

Representa conteúdo de ajuda contextual para uma seção.

```typescript
export type HelpContent = {
  id: string;
  title: string;
  description: string;
  example?: string;
  relatedLinks?: Array<{
    label: string;
    url: string;
  }>;
};
```

**Validations**:
- `id`: String única (kebab-case, ex: "api-key-section")
- `title`: String não vazia (1-100 caracteres)
- `description`: String não vazia (1-1000 caracteres)
- `example`: String opcional (1-500 caracteres)
- `relatedLinks`: Array opcional de objetos com label e url válidos

**Business Rules**:
- `id` deve ser único em todo o sistema
- `example` deve ser concreto e prático
- `relatedLinks` devem ser URLs válidas (http/https)

---

### FAQItem

Representa uma pergunta frequente.

```typescript
export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: 'getting-started' | 'features' | 'troubleshooting';
  order: number;
};
```

**Validations**:
- `id`: String única
- `question`: String não vazia (1-200 caracteres)
- `answer`: String não vazia (1-2000 caracteres)
- `category`: Enum de categorias válidas
- `order`: Inteiro >= 0

**Business Rules**:
- `order` determina sequência de exibição dentro da categoria
- `answer` pode conter markdown simples (negrito, itálico, links)

---

## Storage Strategy

### localStorage Structure

```typescript
// Chave: 'clockify-tour-state'
interface TourStorage {
  tourCompleted: boolean;
  tourSkipped: boolean;
  lastCompletedAt?: string;
  version: string;
}

// Chave: 'clockify-help-preferences'
interface HelpPreferences {
  showHelpIcons: boolean;
  lastViewedFAQ?: string;
}
```

**Storage Keys**:
- `clockify-tour-state`: Estado do tour
- `clockify-help-preferences`: Preferências de ajuda

**Persistence Rules**:
- Dados salvos após cada mudança de estado
- Leitura no mount dos componentes
- Fallback para valores padrão se chave não existe

---

## State Transitions

### TourState Lifecycle

```
[Primeira Visita]
    ↓
[Tour Ativo - Step 0]
    ↓ (usuário completa ação)
[Tour Ativo - Step 1]
    ↓ (usuário completa ação)
[Tour Ativo - Step 2]
    ↓ (usuário completa última ação)
[Tour Completado]

[Qualquer Step] → (usuário clica "Pular") → [Tour Pulado]
```

**Regras**:
- Tour inicia automaticamente na primeira visita
- Avança automaticamente quando usuário completa ação esperada
- Pode ser pulado a qualquer momento
- Não reaparece após completado ou pulado (mesma versão)

---

### HelpTooltip State

```
[Fechado]
    ↓ (usuário clica ícone ?)
[Aberto]
    ↓ (usuário clica fora ou ESC)
[Fechado]
```

**Regras**:
- Apenas um tooltip aberto por vez
- Fecha automaticamente ao abrir outro
- Fecha ao clicar fora ou pressionar ESC

---

## Data Flow

### Inicialização do Tour

```
App Mount
    ↓
useTourState hook
    ↓
Ler localStorage ('clockify-tour-state')
    ↓
Se não existe ou versão diferente → isFirstVisit = true
    ↓
Se isFirstVisit → Exibir TourOverlay
    ↓
TourOverlay renderiza com passos definidos
```

---

### Progressão do Tour

```
Usuário completa ação (ex: ativa API Key)
    ↓
Evento detectado (callback do react-joyride)
    ↓
useTourState.nextStep()
    ↓
Atualizar currentStep
    ↓
Se último passo → Marcar tourCompleted
    ↓
Salvar em localStorage
    ↓
Re-render TourOverlay com novo passo
```

---

### Exibição de Ajuda Contextual

```
Usuário clica ícone (?)
    ↓
HelpIcon onClick handler
    ↓
useHelpContent.getContent(sectionId)
    ↓
Buscar conteúdo em HELP_CONTENT const
    ↓
Exibir HelpTooltip com conteúdo
    ↓
Posicionar via Floating UI
```

---

## Constants Structure

### Tour Steps Definition

```typescript
// src/constants/tour-steps.ts
export const TOUR_STEPS: TourStep[] = [
  {
    target: '#api-key-input',
    title: 'Configure sua API Key',
    content: 'Insira sua chave de acesso do Clockify para começar...',
    disableBeacon: true,
    placement: 'bottom',
    spotlightClicks: true,
    action: 'api-key-activated',
  },
  {
    target: '#load-entries-button',
    title: 'Carregue suas entradas',
    content: 'Clique aqui para carregar as entradas de tempo do dia selecionado...',
    disableBeacon: false,
    placement: 'bottom',
    spotlightClicks: true,
    action: 'entries-loaded',
  },
  {
    target: '#copy-project-button',
    title: 'Exporte para Excel',
    content: 'Clique para copiar os dados formatados para colar no Excel...',
    disableBeacon: false,
    placement: 'left',
    spotlightClicks: true,
    action: 'export-copied',
  },
];

export const TOUR_VERSION = '1.0.0';
```

---

### Help Content Definition

```typescript
// src/constants/help-content.ts
export const HELP_CONTENT: Record<string, HelpContent> = {
  'api-key': {
    id: 'api-key',
    title: 'API Key do Clockify',
    description: 'Sua chave de acesso pessoal permite que a aplicação busque suas entradas de tempo do Clockify.',
    example: 'Encontre em: Clockify → Settings → API → Generate New API Key',
    relatedLinks: [
      {
        label: 'Como obter API Key',
        url: 'https://clockify.me/help/api/api-keys',
      },
    ],
  },
  'export-profiles': {
    id: 'export-profiles',
    title: 'Perfis de Exportação',
    description: 'Crie perfis para diferentes contextos de trabalho. Cada perfil define quais projetos exportar e em qual coluna do Excel.',
    example: 'Ex: "Cliente A" com projetos XYZ na coluna 5',
  },
  'project-mapping': {
    id: 'project-mapping',
    title: 'De-Para de Projetos',
    description: 'Configure como os nomes dos projetos do Clockify aparecem no Excel. Útil para abreviar ou padronizar nomes.',
    example: 'Ex: "Projeto Interno XYZ" → "PI-XYZ"',
  },
  'hours-column': {
    id: 'hours-column',
    title: 'Coluna de Horas',
    description: 'Define em qual coluna do Excel as horas serão exportadas. A=1, B=2, C=3, etc.',
    example: 'Ex: Coluna 7 = Coluna G no Excel',
  },
};
```

---

### FAQ Definition

```typescript
// src/constants/faq.ts
export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'how-to-get-api-key',
    question: 'Como obter minha API Key do Clockify?',
    answer: 'Acesse Clockify → Settings → API → Generate New API Key. Copie a chave gerada e cole no campo "API Key" desta aplicação.',
    category: 'getting-started',
    order: 1,
  },
  {
    id: 'what-are-profiles',
    question: 'O que são Perfis de Exportação?',
    answer: 'Perfis permitem salvar diferentes configurações de exportação. Por exemplo, você pode ter um perfil "Cliente A" que exporta apenas projetos daquele cliente, e outro "Cliente B" com projetos diferentes.',
    category: 'features',
    order: 1,
  },
  {
    id: 'api-key-not-working',
    question: 'Minha API Key não está funcionando',
    answer: 'Verifique se: (1) A chave foi copiada corretamente sem espaços extras, (2) Você tem permissões no Clockify, (3) A chave não expirou. Se o problema persistir, gere uma nova chave.',
    category: 'troubleshooting',
    order: 1,
  },
  {
    id: 'tour-restart',
    question: 'Como reiniciar o tour inicial?',
    answer: 'Clique no botão "Ajuda" (?) no canto superior direito e selecione "Reiniciar Tour".',
    category: 'getting-started',
    order: 2,
  },
  {
    id: 'data-privacy',
    question: 'Meus dados são enviados para algum servidor?',
    answer: 'Não. Esta aplicação funciona 100% no seu navegador. Todos os dados (API Key, perfis, configurações) são armazenados localmente no seu computador.',
    category: 'getting-started',
    order: 3,
  },
];
```

---

## Validation Rules Summary

### TourState

| Campo | Regra | Mensagem de Erro |
|-------|-------|------------------|
| `tourCompleted` | Boolean | N/A (type-safe) |
| `tourSkipped` | Boolean | N/A (type-safe) |
| `currentStep` | >= 0 | "Passo inválido" |
| `version` | Semver format | "Versão inválida" |

### HelpContent

| Campo | Regra | Mensagem de Erro |
|-------|-------|------------------|
| `id` | Único, kebab-case | "ID duplicado ou inválido" |
| `title` | 1-100 chars | "Título muito curto/longo" |
| `description` | 1-1000 chars | "Descrição muito curta/longa" |

---

## Performance Considerations

### Lazy Loading

**Decisão**: Não aplicar lazy loading

**Rationale**:
- Conteúdo de ajuda é pequeno (< 10KB total)
- Definido como const TypeScript (incluído no bundle)
- Sem latência de fetch
- Tree-shaking remove conteúdo não usado

### Memoization

**Decisão**: Memoizar componentes pesados

**Implementação**:
- `TourOverlay`: React.memo (evita re-render desnecessário)
- `HelpTooltip`: React.memo (apenas re-render quando conteúdo muda)
- `useTourState`: useMemo para computações

---

## Error Handling

### Storage Errors

```typescript
// Erro de quota excedida
class StorageQuotaError extends Error {
  constructor() {
    super('Espaço de armazenamento insuficiente');
    this.name = 'StorageQuotaError';
  }
}

// Erro de acesso negado
class StorageAccessError extends Error {
  constructor() {
    super('Acesso ao armazenamento negado');
    this.name = 'StorageAccessError';
  }
}
```

### Fallback Strategy

```typescript
// Se localStorage não disponível
const fallbackState: TourState = {
  tourCompleted: false,
  tourSkipped: false,
  currentStep: 0,
  lastCompletedAt: null,
  version: TOUR_VERSION,
};
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('TourState', () => {
  test('inicializa com valores padrão');
  test('avança para próximo passo');
  test('marca como completado no último passo');
  test('permite pular tour');
  test('persiste em localStorage');
  test('detecta primeira visita');
  test('invalida tour em mudança de versão');
});

describe('HelpContent', () => {
  test('retorna conteúdo por ID');
  test('retorna undefined para ID inexistente');
  test('valida estrutura de conteúdo');
});
```

---

## Summary

O modelo de dados foi projetado para:

✅ **Simplicidade**: Estruturas planas, sem relacionamentos complexos  
✅ **Type-Safety**: TypeScript garante tipos corretos  
✅ **Performance**: Conteúdo em const, sem fetch  
✅ **Persistência**: localStorage para estado do tour  
✅ **Testabilidade**: Interfaces bem definidas, fácil de mockar  
✅ **Manutenibilidade**: Versionamento permite evolução do tour

Próximo passo: Criar contracts (não aplicável, projeto é client-side) e quickstart.md.
