# Quickstart: Guia Interativo do Usuário

**Feature**: 002-user-guide  
**Date**: 2024-12-30  
**For**: Desenvolvedores implementando esta feature

## Visão Geral

Este guia fornece um passo a passo para implementar o sistema de guia interativo e ajuda contextual, seguindo a arquitetura em camadas do projeto.

## Pré-requisitos

- Node.js 20+ instalado
- Projeto clonado e dependências instaladas (`npm install`)
- Familiaridade com Next.js App Router, React Hooks, e localStorage
- Leitura de `spec.md`, `research.md`, e `data-model.md`

## Ordem de Implementação

### Fase 1: Setup e Dependências

#### 1.1. Instalar Dependências

**Comando**:
```bash
npm install react-joyride @floating-ui/react
```

**Validação**: 
- Verificar `package.json` contém as novas dependências
- Executar `npm run dev` sem erros

---

### Fase 2: Domínio e Constantes (Foundation)

#### 2.1. Criar Tipos de Domínio

**Arquivo**: `src/domain/tour.ts`

```typescript
export type TourState = {
  tourCompleted: boolean;
  tourSkipped: boolean;
  currentStep: number;
  lastCompletedAt: string | null;
  version: string;
};

export type TourStep = {
  target: string;
  title: string;
  content: string;
  disableBeacon: boolean;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  spotlightClicks: boolean;
  action?: string;
};

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

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: 'getting-started' | 'features' | 'troubleshooting';
  order: number;
};
```

**Validação**: TypeScript compila sem erros

---

#### 2.2. Criar Constantes de Tour

**Arquivo**: `src/constants/tour-steps.ts`

```typescript
import type { TourStep } from '@/src/domain/tour';

export const TOUR_VERSION = '1.0.0';

export const TOUR_STEPS: TourStep[] = [
  {
    target: '#api-key-input',
    title: 'Configure sua API Key',
    content: 'Insira sua chave de acesso do Clockify para começar. Encontre em: Clockify → Settings → API',
    disableBeacon: true,
    placement: 'bottom',
    spotlightClicks: true,
    action: 'api-key-activated',
  },
  {
    target: '#load-entries-button',
    title: 'Carregue suas entradas',
    content: 'Clique aqui para carregar as entradas de tempo do dia selecionado.',
    disableBeacon: false,
    placement: 'bottom',
    spotlightClicks: true,
    action: 'entries-loaded',
  },
  {
    target: '#copy-project-button',
    title: 'Exporte para Excel',
    content: 'Clique para copiar os dados formatados. Cole no Excel para finalizar!',
    disableBeacon: false,
    placement: 'left',
    spotlightClicks: true,
    action: 'export-copied',
  },
];
```

**Validação**: Arquivo compila, constantes exportadas corretamente

---

#### 2.3. Criar Constantes de Ajuda

**Arquivo**: `src/constants/help-content.ts`

```typescript
import type { HelpContent } from '@/src/domain/tour';

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
    description: 'Configure como os nomes dos projetos do Clockify aparecem no Excel.',
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

#### 2.4. Criar Constantes de FAQ

**Arquivo**: `src/constants/faq.ts`

```typescript
import type { FAQItem } from '@/src/domain/tour';

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
    answer: 'Perfis permitem salvar diferentes configurações de exportação. Por exemplo, você pode ter um perfil "Cliente A" que exporta apenas projetos daquele cliente.',
    category: 'features',
    order: 1,
  },
  {
    id: 'api-key-not-working',
    question: 'Minha API Key não está funcionando',
    answer: 'Verifique se: (1) A chave foi copiada corretamente sem espaços extras, (2) Você tem permissões no Clockify, (3) A chave não expirou.',
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
    answer: 'Não. Esta aplicação funciona 100% no seu navegador. Todos os dados são armazenados localmente.',
    category: 'getting-started',
    order: 3,
  },
];
```

---

### Fase 3: Infraestrutura (Storage)

#### 3.1. Criar Wrapper de localStorage

**Arquivo**: `src/infra/storage/tour-storage.ts`

```typescript
import type { TourState } from '@/src/domain/tour';
import { TOUR_VERSION } from '@/src/constants/tour-steps';

const TOUR_STATE_KEY = 'clockify-tour-state';

export class TourStorage {
  static get(): TourState | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(TOUR_STATE_KEY);
      if (!stored) return null;
      
      return JSON.parse(stored) as TourState;
    } catch {
      return null;
    }
  }

  static set(state: TourState): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(TOUR_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save tour state:', error);
    }
  }

  static clear(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(TOUR_STATE_KEY);
    } catch (error) {
      console.error('Failed to clear tour state:', error);
    }
  }

  static isFirstVisit(): boolean {
    const state = this.get();
    if (!state) return true;
    
    return state.version !== TOUR_VERSION;
  }
}
```

**Validação**: Testar get/set/clear em navegador

---

### Fase 4: Hooks (Business Logic)

#### 4.1. Implementar useTourState

**Arquivo**: `hooks/useTourState.ts`

```typescript
"use client";

import { useEffect, useState, useCallback } from 'react';
import type { TourState } from '@/src/domain/tour';
import { TourStorage } from '@/src/infra/storage/tour-storage';
import { TOUR_VERSION, TOUR_STEPS } from '@/src/constants/tour-steps';

export function useTourState() {
  const [state, setState] = useState<TourState>({
    tourCompleted: false,
    tourSkipped: false,
    currentStep: 0,
    lastCompletedAt: null,
    version: TOUR_VERSION,
  });
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const stored = TourStorage.get();
    if (!stored || stored.version !== TOUR_VERSION) {
      setIsFirstVisit(true);
    } else {
      setState(stored);
      setIsFirstVisit(false);
    }
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      const newStep = prev.currentStep + 1;
      const isLastStep = newStep >= TOUR_STEPS.length;
      
      const newState: TourState = {
        ...prev,
        currentStep: newStep,
        tourCompleted: isLastStep,
        lastCompletedAt: isLastStep ? new Date().toISOString() : prev.lastCompletedAt,
      };
      
      TourStorage.set(newState);
      return newState;
    });
  }, []);

  const skipTour = useCallback(() => {
    const newState: TourState = {
      ...state,
      tourSkipped: true,
    };
    
    setState(newState);
    TourStorage.set(newState);
  }, [state]);

  const resetTour = useCallback(() => {
    TourStorage.clear();
    setState({
      tourCompleted: false,
      tourSkipped: false,
      currentStep: 0,
      lastCompletedAt: null,
      version: TOUR_VERSION,
    });
    setIsFirstVisit(true);
  }, []);

  const shouldShowTour = isFirstVisit && !state.tourCompleted && !state.tourSkipped;

  return {
    state,
    isFirstVisit,
    shouldShowTour,
    nextStep,
    skipTour,
    resetTour,
  };
}
```

**Validação**: Testar hook isoladamente

---

#### 4.2. Implementar useHelpContent

**Arquivo**: `hooks/useHelpContent.ts`

```typescript
"use client";

import { useCallback } from 'react';
import type { HelpContent } from '@/src/domain/tour';
import { HELP_CONTENT } from '@/src/constants/help-content';

export function useHelpContent() {
  const getContent = useCallback((id: string): HelpContent | undefined => {
    return HELP_CONTENT[id];
  }, []);

  const getAllContent = useCallback((): HelpContent[] => {
    return Object.values(HELP_CONTENT);
  }, []);

  return {
    getContent,
    getAllContent,
  };
}
```

---

### Fase 5: Componentes UI

#### 5.1. Criar TourOverlay

**Arquivo**: `app/components/TourOverlay.tsx`

```typescript
"use client";

import { useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, EVENTS } from 'react-joyride';
import { TOUR_STEPS } from '@/src/constants/tour-steps';

type TourOverlayProps = {
  run: boolean;
  currentStep: number;
  onNext: () => void;
  onSkip: () => void;
};

export function TourOverlay({ run, currentStep, onNext, onSkip }: TourOverlayProps) {
  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type } = data;

    if (type === EVENTS.STEP_AFTER) {
      onNext();
    }

    if (status === STATUS.SKIPPED) {
      onSkip();
    }

    if (status === STATUS.FINISHED) {
      onNext();
    }
  }, [onNext, onSkip]);

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      continuous
      showProgress
      showSkipButton
      stepIndex={currentStep}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#06b6d4',
        },
        tooltip: {
          borderRadius: 12,
        },
        buttonNext: {
          backgroundColor: '#06b6d4',
          borderRadius: 8,
        },
        buttonSkip: {
          color: '#94a3b8',
        },
      }}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular tour',
      }}
    />
  );
}
```

---

#### 5.2. Criar HelpIcon

**Arquivo**: `app/components/HelpIcon.tsx`

```typescript
"use client";

type HelpIconProps = {
  onClick: () => void;
  className?: string;
};

export function HelpIcon({ onClick, className = '' }: HelpIconProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-slate-100 transition-colors ${className}`}
      aria-label="Ajuda"
      title="Clique para ver ajuda"
    >
      <span className="text-xs font-bold">?</span>
    </button>
  );
}
```

---

#### 5.3. Criar HelpTooltip

**Arquivo**: `app/components/HelpTooltip.tsx`

```typescript
"use client";

import { useFloating, offset, flip, shift } from '@floating-ui/react';
import type { HelpContent } from '@/src/domain/tour';

type HelpTooltipProps = {
  content: HelpContent;
  anchorEl: HTMLElement | null;
  onClose: () => void;
};

export function HelpTooltip({ content, anchorEl, onClose }: HelpTooltipProps) {
  const { refs, floatingStyles } = useFloating({
    elements: {
      reference: anchorEl,
    },
    placement: 'bottom',
    middleware: [offset(10), flip(), shift()],
  });

  if (!anchorEl) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      />
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        className="z-50 max-w-sm p-4 bg-slate-800 border border-slate-700 rounded-lg shadow-xl"
      >
        <h3 className="text-sm font-semibold text-slate-100 mb-2">
          {content.title}
        </h3>
        <p className="text-xs text-slate-300 mb-2">
          {content.description}
        </p>
        {content.example && (
          <div className="p-2 bg-slate-900 rounded text-xs text-slate-400 font-mono">
            {content.example}
          </div>
        )}
        {content.relatedLinks && content.relatedLinks.length > 0 && (
          <div className="mt-3 space-y-1">
            {content.relatedLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-cyan-400 hover:text-cyan-300"
              >
                {link.label} →
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
```

---

#### 5.4. Criar HelpMenu

**Arquivo**: `app/components/HelpMenu.tsx`

```typescript
"use client";

import { useState } from 'react';

type HelpMenuProps = {
  onRestartTour: () => void;
  onShowFAQ: () => void;
};

export function HelpMenu({ onRestartTour, onShowFAQ }: HelpMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors"
        aria-label="Menu de ajuda"
      >
        <span className="text-lg">?</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
            <button
              onClick={() => {
                onRestartTour();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 rounded-t-lg"
            >
              Reiniciar Tour
            </button>
            <button
              onClick={() => {
                onShowFAQ();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 rounded-b-lg"
            >
              FAQ
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

---

#### 5.5. Criar FAQModal

**Arquivo**: `app/components/FAQModal.tsx`

```typescript
"use client";

import { FAQ_ITEMS } from '@/src/constants/faq';

type FAQModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function FAQModal({ isOpen, onClose }: FAQModalProps) {
  if (!isOpen) return null;

  const categories = {
    'getting-started': 'Primeiros Passos',
    'features': 'Funcionalidades',
    'troubleshooting': 'Solução de Problemas',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-100">
            Perguntas Frequentes
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {Object.entries(categories).map(([key, label]) => {
            const items = FAQ_ITEMS.filter((item) => item.category === key).sort(
              (a, b) => a.order - b.order
            );

            if (items.length === 0) return null;

            return (
              <div key={key}>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  {label}
                </h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-800 rounded-lg">
                      <h4 className="text-sm font-medium text-slate-100 mb-1">
                        {item.question}
                      </h4>
                      <p className="text-xs text-slate-400">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

---

### Fase 6: Integração

#### 6.1. Modificar page.tsx

**Arquivo**: `app/page.tsx`

Adicionar no início do componente:

```typescript
const { shouldShowTour, state, nextStep, skipTour, resetTour } = useTourState();
const [showFAQ, setShowFAQ] = useState(false);
```

Adicionar antes do `</main>`:

```typescript
<TourOverlay
  run={shouldShowTour}
  currentStep={state.currentStep}
  onNext={nextStep}
  onSkip={skipTour}
/>

<FAQModal
  isOpen={showFAQ}
  onClose={() => setShowFAQ(false)}
/>
```

---

#### 6.2. Modificar layout.tsx

**Arquivo**: `app/layout.tsx`

Adicionar HelpMenu no header (se houver), ou criar header simples:

```typescript
<HelpMenu
  onRestartTour={resetTour}
  onShowFAQ={() => setShowFAQ(true)}
/>
```

---

#### 6.3. Adicionar HelpIcons em Componentes

**Exemplo em ApiKeySection**:

```typescript
<div className="flex items-center gap-2">
  <label>API Key</label>
  <HelpIcon onClick={() => showHelp('api-key')} />
</div>
```

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Lint
npm run lint
```

---

## Troubleshooting

### Tour não aparece

**Problema**: Tour não é exibido na primeira visita  
**Solução**:
1. Limpar localStorage: DevTools → Application → Local Storage → Delete
2. Recarregar página
3. Verificar `shouldShowTour` no hook

---

### Tooltips não posicionam corretamente

**Problema**: Tooltips aparecem fora da tela  
**Solução**:
1. Verificar Floating UI está instalado
2. Verificar middleware (flip, shift) está configurado
3. Testar em diferentes tamanhos de tela

---

## Próximos Passos

Após implementação completa:

1. **Testar fluxo completo**: Tour → Ajuda Contextual → FAQ
2. **Validar acessibilidade**: Navegação por teclado, screen readers
3. **Testar responsividade**: Desktop, tablet, mobile
4. **Code Review**: Verificar aderência à constituição
5. **Deploy**: Merge para branch principal

---

## Estimativa de Tempo

| Fase | Estimativa | Prioridade |
|------|-----------|-----------|
| Fase 1: Setup | 0.5 hora | P1 |
| Fase 2: Domínio/Constantes | 2 horas | P1 |
| Fase 3: Infraestrutura | 1 hora | P1 |
| Fase 4: Hooks | 3 horas | P1 |
| Fase 5: Componentes | 6 horas | P1 |
| Fase 6: Integração | 2 horas | P1 |
| **Total** | **14.5 horas** | - |

**Nota**: Estimativas para desenvolvedor familiarizado com a stack.
