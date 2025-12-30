"use client";

import type { ExportProfile } from "@/src/domain/export-profile";

type ProfileSelectorProps = {
  profiles: ExportProfile[];
  activeProfileId: string | null;
  onSelect: (profileId: string | null) => void;
};

export function ProfileSelector({
  profiles,
  activeProfileId,
  onSelect,
}: ProfileSelectorProps) {
  return (
    <div>
      <label htmlFor="profile-selector" className="block text-sm font-medium text-slate-300 mb-1">
        Perfil Ativo
      </label>
      <select
        id="profile-selector"
        value={activeProfileId ?? ''}
        onChange={(e) => onSelect(e.target.value || null)}
        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        <option value="">Nenhum (padrão)</option>
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name} - Coluna {profile.hoursColumnIndex} - {profile.projectNames.length} projeto(s)
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-slate-400">
        {activeProfileId 
          ? 'Exportação usará apenas os projetos configurados no perfil'
          : 'Exportação incluirá todos os projetos'}
      </p>
    </div>
  );
}
