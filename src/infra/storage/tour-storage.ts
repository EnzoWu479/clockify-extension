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
