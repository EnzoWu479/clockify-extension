# Research: Guia Interativo do Usuário

**Feature**: 002-user-guide  
**Date**: 2024-12-30  
**Status**: Complete

## Overview

Este documento consolida as decisões técnicas e pesquisas realizadas para implementar o sistema de guia interativo e ajuda contextual. O objetivo é resolver todas as clarificações identificadas no Technical Context e estabelecer padrões de implementação.

## Research Items

### 1. Biblioteca de Tour Interativo (NEEDS CLARIFICATION)

**Contexto**: Necessário escolher biblioteca para criar tour interativo com spotlight/overlay, navegação entre passos, e detecção de ações do usuário.

**Opções Avaliadas**:

| Biblioteca | Prós | Contras | Adequação |
|-----------|------|---------|-----------|
| **react-joyride** | Mais popular (12k+ stars), API simples, suporte a callbacks para eventos, customizável com CSS, bem mantida | Requer React 16.3+, bundle size ~50KB | ⭐⭐⭐⭐ Excelente |
| **driver.js** | Leve (~5KB gzipped), vanilla JS (funciona com qualquer framework), animações suaves, sem dependências | API menos React-idiomática, requer wrapper para integração | ⭐⭐⭐ Bom |
| **intro.js** | Madura (10+ anos), muitos recursos, bem documentada | Bundle maior (~70KB), API mais antiga, menos moderna | ⭐⭐ Adequado |
| **shepherd.js** | Muito flexível, suporte a Popper.js para posicionamento, temas customizáveis | Complexidade maior, bundle ~40KB, curva de aprendizado | ⭐⭐⭐ Bom |

**Decisão**: **react-joyride**

**Rationale**:
- Melhor integração com React (API idiomática com hooks e componentes)
- Comunidade ativa e bem mantida (última atualização recente)
- Callbacks robustos para detectar ações do usuário (ex: quando API Key é ativada)
- Customização via CSS alinhada com TailwindCSS do projeto
- Bundle size aceitável para o valor entregue
- Suporte a navegação por teclado e acessibilidade out-of-the-box

**Implementação**:
```bash
npm install react-joyride
```

**Alternativas Consideradas e Rejeitadas**:
- **driver.js**: Rejeitado porque requer wrapper manual para React e perde benefícios de integração nativa
- **intro.js**: Rejeitado por bundle maior e API menos moderna
- **shepherd.js**: Rejeitado por complexidade desnecessária para nosso caso de uso

---

### 2. Framework de Testes (NEEDS CLARIFICATION)

**Contexto**: O projeto não possui framework de testes configurado no `package.json`. Necessário definir solução para garantir testabilidade (Princípio III da constituição).

**Opções Avaliadas**:

| Framework | Prós | Contras | Adequação |
|-----------|------|---------|-----------|
| **Vitest** | Nativo para ESM, rápido, compatível com API do Jest, melhor integração com projetos modernos | Menos maduro que Jest, documentação menor | ⭐⭐⭐⭐ Excelente |
| **Jest** | Padrão do ecossistema React, ampla documentação, suporte a mocks | Configuração mais complexa com Next.js App Router, pode ter conflitos com ESM | ⭐⭐⭐ Bom |
| **Testing Library** | Focado em testes de componentes React, boas práticas de teste de UI | Não é framework completo (precisa de Jest/Vitest) | ⭐⭐ Complementar |

**Decisão**: **Vitest + @testing-library/react** (seguindo decisão da feature 001-profile-configuration)

**Rationale**:
- Consistência com decisão anterior do projeto
- Melhor performance que Jest (até 10x mais rápido)
- API compatível com Jest (fácil migração se necessário)
- Suporte nativo a TypeScript e ESM
- Testing Library para testes de componentes (boas práticas)

**Implementação**:
```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
```

**Nota**: Como a feature 001 já definiu Vitest, não há necessidade de reinstalar. Apenas criar testes específicos para tour.

---

### 3. Estratégia de Persistência do Estado do Tour

**Contexto**: Necessário decidir como persistir estado do tour (completado, pulado, passo atual) para não exibir novamente.

**Opções Avaliadas**:

| Abordagem | Descrição | Prós | Contras |
|-----------|-----------|------|---------|
| **localStorage** | Armazenar estado em `localStorage` do navegador | Simples, rápido, padrão web, sem backend | Limitado a 5-10MB, pode ser limpo pelo usuário |
| **IndexedDB** | Usar IndexedDB existente do projeto | Consistente com arquitetura, mais espaço | Overkill para dados simples, mais complexo |
| **Cookies** | Armazenar em cookies | Persiste entre domínios | Limitado a 4KB, enviado em cada request |
| **sessionStorage** | Armazenar apenas na sessão | Muito simples | Perde dados ao fechar aba (não desejado) |

**Decisão**: **localStorage**

**Rationale**:
- Dados do tour são simples e pequenos (< 1KB)
- Não requer complexidade do IndexedDB
- Padrão web moderno e amplamente suportado
- Fácil de testar e debugar
- Se usuário limpar dados, tour reaparece (comportamento aceitável)

**Implementação**:
```typescript
// Estrutura de dados
interface TourStorage {
  tourCompleted: boolean;
  tourSkipped: boolean;
  lastCompletedAt?: string; // ISO timestamp
  version: string; // Para invalidar tour em atualizações
}

// Chave: 'clockify-tour-state'
```

---

### 4. Estrutura de Conteúdo de Ajuda

**Contexto**: Necessário definir como estruturar e carregar conteúdo de ajuda contextual (tooltips, FAQ).

**Opções Avaliadas**:

| Abordagem | Descrição | Prós | Contras |
|-----------|-----------|------|---------|
| **JSON estático** | Arquivo `help-content.json` em `/public` | Simples, fácil de editar, sem build step | Carregado via fetch (async) |
| **TypeScript const** | Objeto TypeScript em `src/constants/help.ts` | Type-safe, sem fetch, tree-shakeable | Requer rebuild para mudanças |
| **CMS/Backend** | Buscar de API externa | Editável sem deploy | Adiciona complexidade, requer backend |
| **Markdown files** | Arquivos `.md` processados em build | Fácil de escrever, versionável | Requer processador, mais complexo |

**Decisão**: **TypeScript const**

**Rationale**:
- Conteúdo de ajuda é parte do código (não muda frequentemente)
- Type-safety garante estrutura correta
- Sem latência de fetch
- Tree-shaking remove conteúdo não usado
- Fácil de testar
- Mudanças de conteúdo fazem parte do processo de deploy normal

**Implementação**:
```typescript
// src/constants/help-content.ts
export const HELP_CONTENT = {
  'api-key': {
    title: 'API Key do Clockify',
    description: 'Sua chave de acesso pessoal...',
    example: 'Encontre em: Clockify → Settings → API',
  },
  'profiles': {
    title: 'Perfis de Exportação',
    description: 'Crie perfis para diferentes contextos...',
    example: 'Ex: Cliente A, Cliente B, Projetos Internos',
  },
  // ...
} as const;
```

---

### 5. Detecção de Primeira Visita

**Contexto**: Necessário detectar quando é a primeira vez que o usuário acessa a aplicação para exibir tour automaticamente.

**Opções Avaliadas**:

| Abordagem | Descrição | Prós | Contras |
|-----------|-----------|------|---------|
| **Flag em localStorage** | Verificar ausência de chave `clockify-tour-state` | Simples, direto | Falso positivo se usuário limpar dados |
| **Timestamp de primeiro acesso** | Armazenar data da primeira visita | Permite lógica temporal | Mais complexo que necessário |
| **Versão do tour** | Comparar versão armazenada com atual | Permite re-exibir tour em updates | Requer versionamento |

**Decisão**: **Flag em localStorage + Versão**

**Rationale**:
- Combina simplicidade com flexibilidade
- Permite invalidar tour em atualizações importantes
- Se usuário limpar dados, tour reaparece (comportamento aceitável)
- Versão permite melhorias incrementais do tour

**Implementação**:
```typescript
const TOUR_VERSION = '1.0.0';

function isFirstVisit(): boolean {
  const stored = localStorage.getItem('clockify-tour-state');
  if (!stored) return true;
  
  const state = JSON.parse(stored);
  return state.version !== TOUR_VERSION;
}
```

---

### 6. Posicionamento Inteligente de Tooltips

**Contexto**: Tooltips de ajuda contextual devem aparecer próximos ao elemento, mas sem cobrir conteúdo importante.

**Opções Avaliadas**:

| Abordagem | Descrição | Prós | Contras |
|-----------|-----------|------|---------|
| **Popper.js** | Biblioteca especializada em posicionamento | Muito robusto, lida com edge cases | Bundle adicional (~3KB), dependência extra |
| **CSS position + JavaScript** | Calcular posição manualmente | Sem dependências | Complexo, bugs em edge cases |
| **Floating UI** | Sucessor moderno do Popper.js | Modular, tree-shakeable, moderno | Menos maduro |
| **TailwindCSS utilities** | Usar classes do Tailwind | Zero JS, muito leve | Limitado, não adapta dinamicamente |

**Decisão**: **Floating UI (core)**

**Rationale**:
- Moderno e bem mantido
- Tree-shakeable (apenas ~2KB para nosso caso)
- API simples e React-friendly
- Lida automaticamente com viewport boundaries
- Sem dependências pesadas

**Implementação**:
```bash
npm install @floating-ui/react
```

---

### 7. Responsividade do Tour

**Contexto**: Tour deve funcionar em desktop e mobile, adaptando posicionamento e UI.

**Decisão**: **Abordagem Mobile-First com Breakpoints**

**Rationale**:
- react-joyride suporta responsividade out-of-the-box
- Ajustar estilos via TailwindCSS breakpoints
- Em mobile: tooltips ocupam mais espaço, botões maiores
- Em desktop: posicionamento lateral, mais compacto

**Implementação**:
```typescript
const tourStyles = {
  options: {
    zIndex: 10000,
  },
  tooltip: {
    // Mobile: full width
    // Desktop: max 400px
  },
  buttonNext: {
    // Mobile: larger touch target (48px)
    // Desktop: standard (32px)
  },
};
```

---

## Best Practices Identified

### Tour UX

1. **Não bloquear**: Usuário deve poder interagir com a aplicação durante o tour
2. **Progressão natural**: Tour avança quando usuário completa ação (não apenas clica "Próximo")
3. **Escape hatch**: Sempre permitir pular ou fechar
4. **Persistência**: Não re-exibir tour completado
5. **Feedback visual**: Indicador de progresso claro (ex: "Passo 2 de 3")

### Ajuda Contextual

1. **Não intrusivo**: Ícones (?) discretos, não modals automáticos
2. **Contextual**: Ajuda relevante para a seção atual
3. **Exemplos práticos**: Sempre incluir exemplo concreto
4. **Fechamento fácil**: Click fora ou ESC fecha tooltip

### Acessibilidade

1. **Navegação por teclado**: Tab, Enter, ESC funcionam
2. **ARIA labels**: Todos os elementos interativos rotulados
3. **Focus management**: Focus move para elemento destacado no tour
4. **Screen readers**: Anúncios de mudança de passo

---

## Dependencies to Add

```json
{
  "dependencies": {
    "react-joyride": "^2.7.0",
    "@floating-ui/react": "^0.26.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}
```

**Nota**: Vitest já foi adicionado na feature 001, não precisa reinstalar.

---

## Alternatives Considered and Rejected

### Usar Biblioteca de UI Component (Radix, HeadlessUI)
**Rejeitado porque**: react-joyride já fornece componentes de tour completos. Usar biblioteca de UI adicionaria complexidade sem benefício claro.

### Implementar Tour do Zero
**Rejeitado porque**: Viola Princípio V (simplicidade). Reimplementar spotlight/overlay, posicionamento, e acessibilidade é complexo e propenso a bugs.

### Armazenar Conteúdo de Ajuda em Backend
**Rejeitado porque**: Aplicação é 100% client-side. Adicionar backend apenas para conteúdo estático é overkill.

### Usar Context API para Estado do Tour
**Rejeitado porque**: Estado do tour é local ao componente TourOverlay. Context API adicionaria complexidade desnecessária.

---

## Summary

Todas as clarificações técnicas foram resolvidas:

✅ **Biblioteca de Tour**: react-joyride (melhor integração React)  
✅ **Framework de Testes**: Vitest + Testing Library (já definido no projeto)  
✅ **Persistência**: localStorage com versionamento  
✅ **Conteúdo de Ajuda**: TypeScript const (type-safe, sem fetch)  
✅ **Detecção de Primeira Visita**: Flag + versão em localStorage  
✅ **Posicionamento de Tooltips**: Floating UI (moderno, leve)  
✅ **Responsividade**: Mobile-first com breakpoints TailwindCSS

A implementação seguirá os padrões existentes do projeto, respeitando todos os princípios da constituição. Próximo passo: Phase 1 (data-model.md, contracts, quickstart.md).
