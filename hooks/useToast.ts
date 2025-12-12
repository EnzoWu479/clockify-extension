"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ToastState = {
  variant: "success" | "error";
  message: string;
} | null;

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearToast = useCallback(() => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (variant: "success" | "error", message: string, durationMs = 2500) => {
      if (typeof window === "undefined") return;
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
      }
      setToast({ variant, message });
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        setToast(null);
      }, durationMs);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { toast, showToast, clearToast };
}
