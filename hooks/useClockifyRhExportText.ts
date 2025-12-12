"use client";

import { useMemo } from "react";
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

function scoreLunchGap(gapStart: Date, gapEnd: Date, gapMinutes: number): number {
  const start = gapStart.getHours() + gapStart.getMinutes() / 60;
  const end = gapEnd.getHours() + gapEnd.getMinutes() / 60;
  const insideLunchWindow = start >= 11 && end <= 15;
  return gapMinutes + (insideLunchWindow ? 1000 : 0);
}

function mergeIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.start.getTime() - b.start.getTime());

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

export function useClockifyRhExportText(entries: TimeEntry[]) {
  const rhText = useMemo(() => {
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
  }, [entries]);

  return { rhText };
}
