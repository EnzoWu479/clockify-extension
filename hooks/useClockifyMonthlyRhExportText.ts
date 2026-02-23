"use client";

import { useState, useCallback } from "react";
import type { TimeEntry } from "./useClockifyTimeEntries";

type Interval = {
  start: Date;
  end: Date;
};

function formatTime(iso: Date): string {
  return iso.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

function minutesBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / 60000;
}

function scoreLunchGap(
  gapStart: Date,
  gapEnd: Date,
  gapMinutes: number,
): number {
  const start = gapStart.getHours() + gapStart.getMinutes() / 60;
  const end = gapEnd.getHours() + gapEnd.getMinutes() / 60;
  const insideLunchWindow = start >= 11 && end <= 15;
  return gapMinutes + (insideLunchWindow ? 1000 : 0);
}

function mergeIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );

  const merged: Interval[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current.start.getTime() <= last.end.getTime()) {
      if (current.end.getTime() > last.end.getTime()) {
        last.end = current.end;
      }
      continue;
    }

    merged.push(current);
  }

  return merged;
}

function formatDayRhText(entries: TimeEntry[]): string {
  const rawIntervals: Interval[] = entries
    .map((entry) => {
      const start = new Date(entry.timeInterval.start);
      const endIso = entry.timeInterval.end;
      const end = endIso ? new Date(endIso) : null;
      if (!end) return null;
      if (!isValidDate(start) || !isValidDate(end)) return null;
      if (end.getTime() <= start.getTime()) return null;
      return { start, end };
    })
    .filter((value): value is Interval => Boolean(value));

  const merged = mergeIntervals(rawIntervals);

  if (merged.length === 0) return "";

  const dayStart = merged[0].start;
  const dayEnd = merged[merged.length - 1].end;

  let bestGap: { start: Date; end: Date } | null = null;
  let bestScore = -1;

  for (let i = 0; i < merged.length - 1; i += 1) {
    const gapStart = merged[i].end;
    const gapEnd = merged[i + 1].start;
    const gapMinutes = minutesBetween(gapStart, gapEnd);
    if (gapMinutes <= 15) continue;

    const score = scoreLunchGap(gapStart, gapEnd, gapMinutes);
    if (score > bestScore) {
      bestScore = score;
      bestGap = { start: gapStart, end: gapEnd };
    }
  }

  if (!bestGap) {
    return `${formatTime(dayStart)}\t\t\t${formatTime(dayEnd)}`;
  }

  return `${formatTime(dayStart)}\t${formatTime(bestGap.start)}\t${formatTime(bestGap.end)}\t${formatTime(dayEnd)}`;
}

function getDaysInMonth(date: string): Date[] {
  const selectedDate = new Date(`${date}T00:00:00`);
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days: Date[] = [];
  for (let day = firstDay.getDate(); day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}

type UseClockifyMonthlyRhExportTextParams = {
  apiKey: string;
  hasKey: boolean;
  selectedDate: string;
};

export function useClockifyMonthlyRhExportText({
  apiKey,
  hasKey,
  selectedDate,
}: UseClockifyMonthlyRhExportTextParams) {
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);
  const [monthlyError, setMonthlyError] = useState<string | null>(null);

  const loadMonthlyRhText = useCallback(async (): Promise<string> => {
    if (!hasKey) {
      throw new Error("API key não configurada");
    }

    setIsLoadingMonthly(true);
    setMonthlyError(null);

    try {
      const days = getDaysInMonth(selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const parsedDate = new Date(`${selectedDate}T00:00:00`);
      const year = parsedDate.getFullYear();
      const month = parsedDate.getMonth() + 1; // 1-based

      // Single request for the entire month — avoids 429 rate-limit errors
      const response = await fetch(
        `/api/clockify/monthly-time-entries?year=${year}&month=${month}`,
        {
          headers: {
            "x-clockify-api-key": apiKey.trim(),
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Erro ao carregar dados mensais (${response.status})`);
      }

      const data = (await response.json()) as {
        byDate?: Record<string, TimeEntry[]>;
      };
      const byDate = data.byDate ?? {};

      const results = days.map((day) => {
        // Future days: return empty tabs without attempting a request
        if (day.getTime() > today.getTime()) {
          return "\t\t\t";
        }

        const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
        const entries: TimeEntry[] = byDate[dateKey] ?? [];

        if (entries.length > 0) {
          const dayText = formatDayRhText(entries);
          return dayText || "\t\t\t";
        }

        return "\t\t\t";
      });

      return results.join("\n");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao carregar dados mensais";
      setMonthlyError(message);
      throw error;
    } finally {
      setIsLoadingMonthly(false);
    }
  }, [apiKey, hasKey, selectedDate]);

  return {
    loadMonthlyRhText,
    isLoadingMonthly,
    monthlyError,
  };
}
