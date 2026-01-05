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
