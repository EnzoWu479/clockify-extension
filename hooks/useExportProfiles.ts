"use client";

import { useEffect, useState } from "react";
import type { ExportProfile } from "@/src/domain/export-profile";
import { ExportProfileIndexedDbRepository } from "@/src/infra/db/indexeddb/export-profile-indexeddb-repository";

type ProfileError = {
  type: 'validation' | 'storage' | 'not_found' | 'duplicate';
  message: string;
  field?: string;
};

type CreateProfileData = {
  name: string;
  hoursColumnIndex: number;
  projectNames: string[];
};

export function useExportProfiles() {
  const [profiles, setProfiles] = useState<ExportProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ProfileError | null>(null);

  const repository = new ExportProfileIndexedDbRepository();

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProfiles() {
    try {
      setIsLoading(true);
      setError(null);
      const loadedProfiles = await repository.listAll();
      setProfiles(loadedProfiles);
    } catch {
      setError({
        type: 'storage',
        message: 'Erro ao carregar perfis',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function validateProfileData(data: CreateProfileData): ProfileError | null {
    const trimmedName = data.name.trim();
    
    if (trimmedName.length < 3 || trimmedName.length > 100) {
      return {
        type: 'validation',
        message: 'Nome deve ter entre 3 e 100 caracteres',
        field: 'name',
      };
    }

    if (data.hoursColumnIndex < 3 || data.hoursColumnIndex > 20) {
      return {
        type: 'validation',
        message: 'Coluna deve estar entre 3 e 20',
        field: 'hoursColumnIndex',
      };
    }

    if (!data.projectNames || data.projectNames.length === 0) {
      return {
        type: 'validation',
        message: 'Selecione pelo menos um projeto',
        field: 'projectNames',
      };
    }

    return null;
  }

  function checkDuplicateName(name: string, excludeId?: string): boolean {
    const normalizedName = name.trim().toLowerCase();
    return profiles.some(
      (p) => p.id !== excludeId && p.name.trim().toLowerCase() === normalizedName
    );
  }

  async function createProfile(data: CreateProfileData): Promise<void> {
    const validationError = validateProfileData(data);
    if (validationError) {
      setError(validationError);
      throw new Error(validationError.message);
    }

    if (checkDuplicateName(data.name)) {
      const duplicateError: ProfileError = {
        type: 'duplicate',
        message: `Perfil com nome "${data.name}" já existe`,
        field: 'name',
      };
      setError(duplicateError);
      throw new Error(duplicateError.message);
    }

    try {
      setError(null);
      const now = new Date().toISOString();
      const newProfile: ExportProfile = {
        id: crypto.randomUUID(),
        name: data.name.trim(),
        hoursColumnIndex: data.hoursColumnIndex,
        projectNames: data.projectNames,
        createdAt: now,
        updatedAt: now,
      };

      await repository.create(newProfile);
      setProfiles((prev) => [...prev, newProfile].sort((a, b) => 
        a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
      ));
    } catch (err) {
      const storageError: ProfileError = {
        type: 'storage',
        message: 'Erro ao criar perfil',
      };
      setError(storageError);
      throw err;
    }
  }

  async function updateProfile(id: string, data: CreateProfileData): Promise<void> {
    const validationError = validateProfileData(data);
    if (validationError) {
      setError(validationError);
      throw new Error(validationError.message);
    }

    const existingProfile = profiles.find((p) => p.id === id);
    if (!existingProfile) {
      const notFoundError: ProfileError = {
        type: 'not_found',
        message: 'Perfil não encontrado',
      };
      setError(notFoundError);
      throw new Error(notFoundError.message);
    }

    if (checkDuplicateName(data.name, id)) {
      const duplicateError: ProfileError = {
        type: 'duplicate',
        message: `Perfil com nome "${data.name}" já existe`,
        field: 'name',
      };
      setError(duplicateError);
      throw new Error(duplicateError.message);
    }

    try {
      setError(null);
      const updatedProfile: ExportProfile = {
        ...existingProfile,
        name: data.name.trim(),
        hoursColumnIndex: data.hoursColumnIndex,
        projectNames: data.projectNames,
        updatedAt: new Date().toISOString(),
      };

      await repository.update(updatedProfile);
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? updatedProfile : p)).sort((a, b) => 
          a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
        )
      );
    } catch (err) {
      const storageError: ProfileError = {
        type: 'storage',
        message: 'Erro ao atualizar perfil',
      };
      setError(storageError);
      throw err;
    }
  }

  async function deleteProfile(id: string): Promise<{ wasActive: boolean }> {
    try {
      setError(null);
      await repository.delete(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      return { wasActive: false };
    } catch (err) {
      const storageError: ProfileError = {
        type: 'storage',
        message: 'Erro ao excluir perfil',
      };
      setError(storageError);
      throw err;
    }
  }

  function findProfileByName(name: string): ExportProfile | undefined {
    const normalizedName = name.trim().toLowerCase();
    return profiles.find(
      (p) => p.name.trim().toLowerCase() === normalizedName
    );
  }

  return {
    profiles,
    isLoading,
    error,
    createProfile,
    updateProfile,
    deleteProfile,
    findProfileByName,
    clearError: () => setError(null),
  };
}
