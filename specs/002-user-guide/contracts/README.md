# API Contracts

**Feature**: 002-user-guide  
**Date**: 2024-12-30

## Overview

Este diretório normalmente conteria contratos de API (OpenAPI, GraphQL schemas, etc.) para features que envolvem comunicação backend/frontend.

## Not Applicable

Esta feature **não possui contratos de API externos** porque:

1. **Aplicação 100% Client-Side**: Toda a lógica roda no navegador
2. **Persistência Local**: Dados armazenados em localStorage (local storage)
3. **Sem Backend**: Não há endpoints HTTP, GraphQL, ou qualquer API externa
4. **Biblioteca Externa**: react-joyride fornece API própria (documentada externamente)

## Internal Contracts

Os "contratos" desta feature são as **interfaces TypeScript** definidas em:

- **Domain Layer**: `src/domain/tour.ts`
  - `TourState` type
  - `TourStep` type
  - `HelpContent` type
  - `FAQItem` type

- **Hook Layer**: `hooks/useTourState.ts` e `hooks/useHelpContent.ts`
  - Assinaturas de funções exportadas
  - Tipos de retorno dos hooks
  - Tipos de parâmetros

- **Constants**: `src/constants/tour-steps.ts`, `src/constants/help-content.ts`, `src/constants/faq.ts`
  - Estrutura de dados estáticos
  - Configuração de passos do tour
  - Conteúdo de ajuda e FAQ

Estes contratos são documentados em detalhes no arquivo `data-model.md`.

## External Library APIs

A feature integra com bibliotecas externas:

### react-joyride

**Documentação**: https://docs.react-joyride.com/

**Props principais**:
```typescript
interface JoyrideProps {
  steps: Step[];
  run: boolean;
  continuous: boolean;
  showProgress: boolean;
  showSkipButton: boolean;
  callback: (data: CallBackProps) => void;
  styles?: Styles;
}
```

**Callbacks**:
- `TOUR_START`: Tour iniciado
- `STEP_AFTER`: Após transição de passo
- `TOUR_END`: Tour finalizado
- `SKIP`: Usuário pulou tour

### @floating-ui/react

**Documentação**: https://floating-ui.com/docs/react

**Hooks principais**:
```typescript
useFloating({
  placement: 'top' | 'bottom' | 'left' | 'right',
  middleware: [offset(), flip(), shift()],
});
```

## Integration Points

A feature integra com:

1. **localStorage API** (browser nativo)
   - Não requer contrato externo
   - Schema documentado em `data-model.md`

2. **Componentes Existentes**
   - `ApiKeySection`: Adicionar HelpIcon
   - `ExportSettings`: Adicionar HelpIcons em seções
   - `layout.tsx`: Adicionar HelpMenu no header
   - Contratos existentes são preservados (backward compatible)

## Type Safety

TypeScript garante type safety em tempo de compilação para todos os contratos internos. Não há necessidade de validação de schema em runtime para APIs externas.

## Testing Contracts

Contratos de teste (mocks) são definidos em:

- `tests/mocks/tour-state.mock.ts`: Mock de TourState
- `tests/mocks/help-content.mock.ts`: Mock de HelpContent
- `tests/mocks/react-joyride.mock.ts`: Mock de react-joyride

Estes mocks garantem que testes unitários não dependem de implementações reais.
