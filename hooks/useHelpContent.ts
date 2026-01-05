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
