"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { ExportProfile } from "@/src/domain/export-profile";

type ProfileFormProps = {
  mode: 'create' | 'edit';
  initialData?: Partial<ExportProfile>;
  availableProjects: string[];
  onSubmit: (data: ProfileFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error?: string;
};

export type ProfileFormData = {
  name: string;
  hoursColumnIndex: number;
  projectNames: string[];
};

export function ProfileForm({
  mode,
  initialData,
  availableProjects,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}: ProfileFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [hoursColumnIndex, setHoursColumnIndex] = useState(
    initialData?.hoursColumnIndex ?? 7
  );
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(
    new Set(initialData?.projectNames ?? [])
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      hoursColumnIndex,
      projectNames: Array.from(selectedProjects),
    });
  }

  function toggleProject(projectName: string) {
    setSelectedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectName)) {
        next.delete(projectName);
      } else {
        next.add(projectName);
      }
      return next;
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="profile-name" className="block text-sm font-medium text-slate-300 mb-1">
          Nome do Perfil
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Ex: Cliente A"
          required
          minLength={3}
          maxLength={100}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="hours-column" className="block text-sm font-medium text-slate-300 mb-1">
          Coluna de Horas no Excel
        </label>
        <input
          id="hours-column"
          type="number"
          value={hoursColumnIndex}
          onChange={(e) => setHoursColumnIndex(Number(e.target.value))}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          min={3}
          max={20}
          required
          disabled={isSubmitting}
        />
        <p className="mt-1 text-xs text-slate-400">Entre 3 e 20</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Projetos Incluídos
        </label>
        <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-700 rounded-lg p-3 bg-slate-800/50">
          {availableProjects.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum projeto disponível</p>
          ) : (
            availableProjects.map((projectName) => (
              <label
                key={projectName}
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedProjects.has(projectName)}
                  onChange={() => toggleProject(projectName)}
                  className="w-4 h-4 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-slate-200">{projectName}</span>
              </label>
            ))
          )}
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Selecionados: {selectedProjects.size}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/50 rounded-lg">
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || selectedProjects.size === 0}
          className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
        >
          {isSubmitting ? 'Salvando...' : mode === 'create' ? 'Criar Perfil' : 'Salvar Alterações'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-slate-300 rounded-lg font-medium transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
