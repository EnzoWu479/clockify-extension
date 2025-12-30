"use client";

import { useState } from "react";
import type { ExportProfile } from "@/src/domain/export-profile";
import { ProfileForm, type ProfileFormData } from "./ProfileForm";
import { ProfileList } from "./ProfileList";
import { ProfileSelector } from "./ProfileSelector";

type ProfileManagerProps = {
  profiles: ExportProfile[];
  activeProfileId: string | null;
  availableProjects: string[];
  isLoading: boolean;
  error: string | null;
  onCreateProfile: (data: ProfileFormData) => Promise<void>;
  onUpdateProfile: (id: string, data: ProfileFormData) => Promise<void>;
  onDeleteProfile: (id: string) => Promise<void>;
  onSetActiveProfile: (profileId: string | null) => Promise<void>;
  onClearError: () => void;
};

export function ProfileManager({
  profiles,
  activeProfileId,
  availableProjects,
  isLoading,
  error,
  onCreateProfile,
  onUpdateProfile,
  onDeleteProfile,
  onSetActiveProfile,
  onClearError,
}: ProfileManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingProfile, setEditingProfile] = useState<ExportProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleCreateClick() {
    setFormMode('create');
    setEditingProfile(null);
    setShowForm(true);
    onClearError();
  }

  function handleEditClick(profile: ExportProfile) {
    setFormMode('edit');
    setEditingProfile(profile);
    setShowForm(true);
    onClearError();
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingProfile(null);
    onClearError();
  }

  async function handleSubmitForm(data: ProfileFormData) {
    setIsSubmitting(true);
    try {
      if (formMode === 'create') {
        await onCreateProfile(data);
      } else if (editingProfile) {
        await onUpdateProfile(editingProfile.id, data);
      }
      setShowForm(false);
      setEditingProfile(null);
    } catch {
      // Error já está no estado do hook
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteProfile(profile: ExportProfile) {
    try {
      await onDeleteProfile(profile.id);
    } catch {
      // Error já está no estado do hook
    }
  }

  async function handleActivateProfile(profileId: string) {
    try {
      await onSetActiveProfile(profileId);
    } catch {
      // Error já está no estado do hook
    }
  }

  async function handleSelectProfile(profileId: string | null) {
    try {
      await onSetActiveProfile(profileId);
    } catch {
      // Error já está no estado do hook
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-slate-400">Carregando perfis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Perfis de Exportação</h3>
        {!showForm && (
          <button
            onClick={handleCreateClick}
            className="px-3 py-1.5 text-xs font-medium bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
          >
            + Novo Perfil
          </button>
        )}
      </div>

      {showForm ? (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <h4 className="text-sm font-medium text-slate-200 mb-3">
            {formMode === 'create' ? 'Criar Novo Perfil' : 'Editar Perfil'}
          </h4>
          <ProfileForm
            mode={formMode}
            initialData={editingProfile ?? undefined}
            availableProjects={availableProjects}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
            error={error ?? undefined}
          />
        </div>
      ) : (
        <>
          <ProfileSelector
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSelect={handleSelectProfile}
          />

          <ProfileList
            profiles={profiles}
            activeProfileId={activeProfileId}
            onEdit={handleEditClick}
            onDelete={handleDeleteProfile}
            onActivate={handleActivateProfile}
          />
        </>
      )}
    </div>
  );
}
