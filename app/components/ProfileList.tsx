"use client";

import { useState } from "react";
import type { ExportProfile } from "@/src/domain/export-profile";

type ProfileListProps = {
  profiles: ExportProfile[];
  activeProfileId: string | null;
  onEdit: (profile: ExportProfile) => void;
  onDelete: (profile: ExportProfile) => void;
  onActivate: (profileId: string) => void;
};

export function ProfileList({
  profiles,
  activeProfileId,
  onEdit,
  onDelete,
  onActivate,
}: ProfileListProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  function handleDeleteClick(profile: ExportProfile) {
    setDeleteConfirmId(profile.id);
  }

  function handleConfirmDelete(profile: ExportProfile) {
    onDelete(profile);
    setDeleteConfirmId(null);
  }

  function handleCancelDelete() {
    setDeleteConfirmId(null);
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-slate-400">
          Nenhum perfil criado. Crie seu primeiro perfil para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {profiles.map((profile) => {
        const isActive = profile.id === activeProfileId;
        const isDeleting = deleteConfirmId === profile.id;

        return (
          <div
            key={profile.id}
            className={`p-3 rounded-lg border transition-colors ${
              isActive
                ? 'bg-cyan-500/10 border-cyan-500/50'
                : 'bg-slate-800/50 border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-slate-100 truncate">
                    {profile.name}
                  </h4>
                  {isActive && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-cyan-500/20 text-cyan-300 rounded">
                      Ativo
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                  <span>Coluna: {profile.hoursColumnIndex}</span>
                  <span>•</span>
                  <span>{profile.projectNames.length} projeto(s)</span>
                </div>
              </div>

              {!isDeleting ? (
                <div className="flex items-center gap-2">
                  {!isActive && (
                    <button
                      onClick={() => onActivate(profile.id)}
                      className="px-3 py-1 text-xs font-medium bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded transition-colors"
                      title="Ativar perfil"
                    >
                      Ativar
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(profile)}
                    className="px-3 py-1 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                    title="Editar perfil"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteClick(profile)}
                    className="px-3 py-1 text-xs font-medium bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded transition-colors"
                    title="Excluir perfil"
                  >
                    Excluir
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Confirmar exclusão?</span>
                  <button
                    onClick={() => handleConfirmDelete(profile)}
                    className="px-3 py-1 text-xs font-medium bg-rose-500 hover:bg-rose-600 text-white rounded transition-colors"
                  >
                    Sim
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="px-3 py-1 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                  >
                    Não
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
