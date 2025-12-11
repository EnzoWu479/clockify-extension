"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProjectMapping } from "@/src/domain/project-mapping";
import { ProjectMappingIndexedDbRepository } from "@/src/infra/db/indexeddb/project-mapping-indexeddb-repository";

const repository = new ProjectMappingIndexedDbRepository();

export function useProjectMappings() {
  const [mappings, setMappings] = useState<ProjectMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (typeof window === "undefined") return;
      try {
        const items = await repository.listAll();
        if (isMounted) {
          setMappings(items);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  async function upsertMapping(clockifyProjectName: string, excelValue: string) {
    const trimmedName = clockifyProjectName.trim();
    const trimmedExcel = excelValue.trim();
    if (!trimmedName) return;

    const id = trimmedName.toLowerCase();

    const mapping: ProjectMapping = {
      id,
      clockifyProjectName: trimmedName,
      excelValue: trimmedExcel || trimmedName,
    };

    await repository.upsert(mapping);
    setMappings((current) => {
      const without = current.filter((item) => item.id !== id);
      return [...without, mapping].sort((a, b) =>
        a.clockifyProjectName.localeCompare(b.clockifyProjectName, "pt-BR"),
      );
    });
  }

  const getExcelValueForProjectName = useMemo(
    () =>
      (clockifyProjectName: string | undefined | null): string | undefined => {
        if (!clockifyProjectName) return undefined;
        const normalized = clockifyProjectName.trim().toLowerCase();
        const found = mappings.find(
          (mapping) => mapping.id === normalized,
        );
        return found?.excelValue;
      },
    [mappings],
  );

  return {
    mappings,
    isLoading,
    upsertMapping,
    getExcelValueForProjectName,
  };
}
