"use client";

import type { ExportProfile } from "@/src/domain/export-profile";
import { ProfileManager } from "./ProfileManager";
import type { ProfileFormData } from "./ProfileForm";
import { HelpIcon } from "./HelpIcon";

type ExportSettingsProps = {
  show: boolean;
  onToggle: () => void;
  hoursColumnIndex: number;
  onHoursColumnChange: (value: number) => void;
  projectNames: string[];
  getExcelValueForProjectName: (name: string) => string | undefined;
  onUpsertMapping: (clockifyProjectName: string, excelValue: string) => void;
  profiles: ExportProfile[];
  activeProfileId: string | null;
  isLoadingProfiles: boolean;
  profileError: string | null;
  onCreateProfile: (data: ProfileFormData) => Promise<void>;
  onUpdateProfile: (id: string, data: ProfileFormData) => Promise<void>;
  onDeleteProfile: (id: string) => Promise<void>;
  onSetActiveProfile: (profileId: string | null) => Promise<void>;
  onClearProfileError: () => void;
  onShowHelpProfiles?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onShowHelpMapping?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onShowHelpColumn?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export function ExportSettings({
  show,
  onToggle,
  hoursColumnIndex,
  onHoursColumnChange,
  projectNames,
  getExcelValueForProjectName,
  onUpsertMapping,
  profiles,
  activeProfileId,
  isLoadingProfiles,
  profileError,
  onCreateProfile,
  onUpdateProfile,
  onDeleteProfile,
  onSetActiveProfile,
  onClearProfileError,
  onShowHelpProfiles,
  onShowHelpMapping,
  onShowHelpColumn,
}: ExportSettingsProps) {
  return (
    <div className="mt-4 rounded-xl border border-slate-800/90 bg-slate-950/70 p-3 text-[0.7rem] text-slate-300">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-[0.7rem] font-semibold text-slate-200">
          Configurações de exportação
        </span>
        <span className="text-[0.7rem] text-slate-500">
          {show ? "Recolher" : "Expandir"}
        </span>
      </button>
      {show && (
        <div className="mt-3 space-y-3">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-3">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-[0.7rem] font-semibold text-slate-200">Perfis de Exportação</p>
              {onShowHelpProfiles && <HelpIcon onClick={onShowHelpProfiles} />}
            </div>
            <ProfileManager
              profiles={profiles}
              activeProfileId={activeProfileId}
              availableProjects={projectNames}
              isLoading={isLoadingProfiles}
              error={profileError}
              onCreateProfile={onCreateProfile}
              onUpdateProfile={onUpdateProfile}
              onDeleteProfile={onDeleteProfile}
              onSetActiveProfile={onSetActiveProfile}
              onClearError={onClearProfileError}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-[0.7rem] text-slate-400">
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-200">
                  Coluna de horas no Excel
                </p>
                {onShowHelpColumn && <HelpIcon onClick={onShowHelpColumn} />}
              </div>
              <p>
                Use o número da coluna (A=1, B=2, ...). O texto das horas será gerado nessa coluna.
              </p>
            </div>
            <input
              type="number"
              min={3}
              max={20}
              value={hoursColumnIndex}
              onChange={(event) => {
                const value = Number.parseInt(event.target.value, 10);
                if (Number.isNaN(value)) return;
                onHoursColumnChange(value);
              }}
              className="w-20 rounded-full border border-slate-700 bg-slate-950/60 px-2 py-1 text-center text-[0.7rem] text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-3">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-[0.7rem] font-semibold text-slate-200">
                De/para de projetos (para Excel)
              </p>
              {onShowHelpMapping && <HelpIcon onClick={onShowHelpMapping} />}
            </div>
            {projectNames.length === 0 ? (
              <p className="mt-2 text-[0.7rem] text-slate-500">
                Carregue um dia com lançamentos para configurar o mapeamento de projetos.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {projectNames.map((projectName) => {
                  const currentExcelValue =
                    getExcelValueForProjectName(projectName) ?? projectName;
                  return (
                    <li
                      key={projectName}
                      className="flex items-center justify-between gap-3"
                    >
                      <span
                        className="truncate text-slate-300"
                        title={projectName}
                      >
                        {projectName}
                      </span>
                      <input
                        defaultValue={currentExcelValue}
                        onBlur={(event) =>
                          onUpsertMapping(projectName, event.target.value)
                        }
                        className="min-w-0 flex-1 rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-[0.7rem] text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        placeholder="Valor para Excel"
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
