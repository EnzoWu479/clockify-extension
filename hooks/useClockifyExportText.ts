"use client";

import { useEffect, useMemo, useState } from "react";
import type { GroupedEntry } from "./useClockifyTimeEntries";

export type CopyStatus = "idle" | "copied" | "error";

export function formatMinutesToHM(minutes: number | null): string {
  if (minutes === null) return "-";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}:${mins.toString().padStart(2, "0")}`;
}

type UseClockifyExportTextParams = {
  groupedEntries: GroupedEntry[];
  hoursColumnIndex: number;
  getExcelValueForProjectName: (name: string) => string | undefined;
};

export function useClockifyExportText({
  groupedEntries,
  hoursColumnIndex,
  getExcelValueForProjectName,
}: UseClockifyExportTextParams) {
  const exportText = useMemo(() => {
    if (groupedEntries.length === 0) return "";

    // coluna 1 = descrição, coluna 2 = projeto, colunas 3..N-1 vazias, coluna N = horas
    const safeColumn = Number.isFinite(hoursColumnIndex)
      ? Math.min(Math.max(Math.trunc(hoursColumnIndex), 3), 20)
      : 7;
    const totalTabs = safeColumn - 2; // descrição já ocupa a primeira coluna
    const projectTabs = 1; // sempre 1 TAB entre descrição e projeto
    const remainingTabs = Math.max(totalTabs - projectTabs, 0);

    const lines = groupedEntries.map((entry) => {
      const duration = formatMinutesToHM(entry.totalMinutes);
      const description = entry.description || "";
      const rawProjectName = entry.projectName ?? "";
      const mappedProject = getExcelValueForProjectName(rawProjectName);
      const project = mappedProject ?? rawProjectName;

      const tabsAfterProject = "\t".repeat(remainingTabs);

      return `${description}\t\t${project}${tabsAfterProject}\t${duration}`;
    });

    return lines.join("\n");
  }, [groupedEntries, getExcelValueForProjectName, hoursColumnIndex]);

  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");

  useEffect(() => {
    setCopyStatus("idle");
  }, [exportText]);

  async function handleCopyToClipboard() {
    if (!exportText) return;

    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw new Error("Clipboard API indisponível");
      }
      await navigator.clipboard.writeText(exportText);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return {
    exportText,
    copyStatus,
    handleCopyToClipboard,
    setCopyStatus,
  };
}
