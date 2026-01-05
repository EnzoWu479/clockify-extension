import type { TourStep } from '@/src/domain/tour';

export const TOUR_VERSION = '1.0.0';

export const TOUR_STEPS: TourStep[] = [
  {
    target: '#api-key-input',
    title: 'Configure sua API Key',
    content: 'Insira sua chave de acesso do Clockify para começar. Encontre em: Clockify → Settings → API → Generate New API Key',
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
