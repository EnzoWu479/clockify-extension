"use client";

import { useEffect, useState } from "react";

export function useClockifyExportSettings() {
  const [hoursColumnIndex, setHoursColumnIndex] = useState<number>(7);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedColumn = window.localStorage.getItem("clockifyHoursColumn");
    if (storedColumn) {
      const parsed = Number.parseInt(storedColumn, 10);
      if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 20) {
        setHoursColumnIndex(parsed);
      }
    }
  }, []);

  function updateHoursColumn(rawValue: number) {
    const clamped = Math.min(Math.max(rawValue, 3), 20);
    setHoursColumnIndex(clamped);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("clockifyHoursColumn", String(clamped));
    }
  }

  return {
    hoursColumnIndex,
    showSettings,
    setShowSettings,
    updateHoursColumn,
  };
}
