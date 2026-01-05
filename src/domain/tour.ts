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
