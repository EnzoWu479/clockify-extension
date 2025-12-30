"use client";

import { useEffect, useState } from "react";
import type { ExportProfile } from "@/src/domain/export-profile";
import { ActiveProfileIndexedDbRepository } from "@/src/infra/db/indexeddb/active-profile-indexeddb-repository";

export function useActiveProfile() {
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const repository = new ActiveProfileIndexedDbRepository();

  useEffect(() => {
    loadActiveProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadActiveProfile() {
    try {
      setIsLoading(true);
      const activeProfile = await repository.get();
      setActiveProfileIdState(activeProfile.profileId);
    } catch {
      setActiveProfileIdState(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function setActiveProfile(profileId: string | null): Promise<void> {
    try {
      await repository.set(profileId);
      setActiveProfileIdState(profileId);
    } catch (err) {
      throw err;
    }
  }

  async function clearActiveProfile(): Promise<void> {
    await setActiveProfile(null);
  }

  function getActiveProfile(profiles: ExportProfile[]): ExportProfile | null {
    if (!activeProfileId) return null;
    return profiles.find((p) => p.id === activeProfileId) ?? null;
  }

  return {
    activeProfileId,
    isLoading,
    setActiveProfile,
    clearActiveProfile,
    getActiveProfile,
  };
}
