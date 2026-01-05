"use client";

import { useState, useCallback } from 'react';
import type { TourState } from '@/src/domain/tour';
import { TourStorage } from '@/src/infra/storage/tour-storage';
import { TOUR_VERSION, TOUR_STEPS } from '@/src/constants/tour-steps';

export function useTourState() {
  const [state, setState] = useState<TourState>(() => {
    const stored = TourStorage.get();
    if (!stored || stored.version !== TOUR_VERSION) {
      return {
        tourCompleted: false,
        tourSkipped: false,
        currentStep: 0,
        lastCompletedAt: null,
        version: TOUR_VERSION,
      };
    }
    return stored;
  });
  
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    const stored = TourStorage.get();
    return !stored || stored.version !== TOUR_VERSION;
  });

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
