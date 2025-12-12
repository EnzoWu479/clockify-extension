"use client";

import { useMemo, useState } from "react";

export type TimeInterval = {
  start: string;
  end: string | null;
  duration: string | null;
};

export type TimeEntry = {
  id: string;
  description: string;
  projectId?: string;
  projectName?: string;
  timeInterval: TimeInterval;
};

export type GroupedEntry = {
  id: string;
  description: string;
  projectName?: string;
  totalMinutes: number;
  firstStart: string | null;
  lastEnd: string | null;
};

function calculateDurationMinutes(
  startIso: string,
  endIso: string | null,
): number | null {
  if (!startIso || !endIso) return null;
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return null;
  return Math.round(diffMs / 60000);
}

function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

type UseClockifyTimeEntriesParams = {
  apiKey: string;
  hasKey: boolean;
};

export function useClockifyTimeEntries({
  apiKey,
  hasKey,
}: UseClockifyTimeEntriesParams) {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIsoDate);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [entriesError, setEntriesError] = useState<string | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  async function loadEntriesForDate(date: string) {
    if (!hasKey) return;

    setIsLoadingEntries(true);
    setEntriesError(null);

    try {
      const response = await fetch(
        `/api/clockify/time-entries?date=${encodeURIComponent(date)}`,
        {
          headers: {
            "x-clockify-api-key": apiKey.trim(),
          },
        },
      );

      if (!response.ok) {
        let message = "Falha ao carregar time entries.";
        try {
          const data = (await response.json()) as { error?: string };
          if (data?.error) {
            message = data.error;
          }
        } catch {
          // ignorar erro de parse
        }
        throw new Error(message);
      }

      const data = (await response.json()) as { items?: TimeEntry[] };
      setEntries(data.items ?? []);
    } catch (error: unknown) {
      setEntries([]);
      if (error instanceof Error) {
        setEntriesError(error.message);
      } else {
        setEntriesError("Erro desconhecido ao carregar time entries.");
      }
    } finally {
      setIsLoadingEntries(false);
    }
  }

  async function loadEntries() {
    await loadEntriesForDate(selectedDate);
  }

  function changeDate(offsetDays: number) {
    if (!selectedDate) return;
    const base = new Date(`${selectedDate}T00:00:00`);
    if (Number.isNaN(base.getTime())) return;
    base.setDate(base.getDate() + offsetDays);
    const next = base.toISOString().slice(0, 10);
    setSelectedDate(next);
    if (hasKey) {
      void loadEntriesForDate(next);
    }
  }

  const groupedEntries = useMemo(() => {
    if (entries.length === 0) return [] as GroupedEntry[];
    const map = new Map<string, GroupedEntry>();

    for (const entry of entries) {
      const description = entry.description || "";
      const projectName = entry.projectName ?? "";
      const key = `${description}|||${projectName}`;
      const minutes =
        calculateDurationMinutes(
          entry.timeInterval.start,
          entry.timeInterval.end,
        ) ?? 0;

      let group = map.get(key);
      if (!group) {
        group = {
          id: key,
          description,
          projectName: projectName || undefined,
          totalMinutes: 0,
          firstStart: entry.timeInterval.start ?? null,
          lastEnd: entry.timeInterval.end ?? null,
        };
        map.set(key, group);
      }

      group.totalMinutes += minutes;

      if (entry.timeInterval.start) {
        if (
          !group.firstStart ||
          new Date(entry.timeInterval.start) < new Date(group.firstStart)
        ) {
          group.firstStart = entry.timeInterval.start;
        }
      }

      if (entry.timeInterval.end) {
        if (
          !group.lastEnd ||
          new Date(entry.timeInterval.end) > new Date(group.lastEnd)
        ) {
          group.lastEnd = entry.timeInterval.end;
        }
      }
    }

    return Array.from(map.values());
  }, [entries]);

  const totalMinutes = useMemo(() => {
    if (groupedEntries.length === 0) return 0;
    return groupedEntries.reduce(
      (sum, entry) => sum + (entry.totalMinutes ?? 0),
      0,
    );
  }, [groupedEntries]);

  const uniqueProjectNames = useMemo(() => {
    if (entries.length === 0) return [] as string[];
    const set = new Set<string>();
    for (const entry of entries) {
      if (entry.projectName) {
        set.add(entry.projectName);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [entries]);

  function clearEntries() {
    setEntries([]);
    setEntriesError(null);
  }

  return {
    entries,
    selectedDate,
    setSelectedDate,
    isLoadingEntries,
    entriesError,
    groupedEntries,
    totalMinutes,
    uniqueProjectNames,
    changeDate,
    loadEntries,
    clearEntries,
  };
}
