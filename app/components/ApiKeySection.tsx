"use client";

import { FormEvent, useState, useEffect } from "react";
import { HelpIcon } from "./HelpIcon";

type ApiKeySectionProps = {
  apiKey: string;
  hasKey: boolean;
  onApiKeyChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
  onShowHelp?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export function ApiKeySection({
  apiKey,
  hasKey,
  onApiKeyChange,
  onSubmit,
  onClear,
  onShowHelp,
}: ApiKeySectionProps) {
  const [isEditMode, setIsEditMode] = useState(!hasKey);

  // Ativa modo edição quando não há chave
  useEffect(() => {
    if (!hasKey) {
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
  }, [hasKey]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    onSubmit(event);
    if (hasKey) {
      setIsEditMode(false);
    }
  };

  const handleClear = () => {
    onClear();
    setIsEditMode(true);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  // Texto fake para quando não está editando
  const displayValue =
    hasKey && !isEditMode ? "••••••••••••••••••••••••••••••••" : apiKey;

  return (
    <div className="w-full max-w-xs">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          Clockify API Key
        </p>
        {onShowHelp && <HelpIcon onClick={onShowHelp} />}
      </div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="rounded-xl border-2 border-slate-300/70 bg-slate-900/40 px-3 py-2 shadow-[0_0_25px_rgba(15,23,42,0.8)]">
          <input
            id="api-key-input"
            type="password"
            value={displayValue}
            onChange={(event) => onApiKeyChange(event.target.value)}
            placeholder="Cole sua API key do Clockify"
            disabled={!isEditMode}
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none disabled:cursor-not-allowed disabled:text-slate-400"
          />
        </div>
        <div className="flex justify-end gap-2">
          {isEditMode && <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/80 bg-slate-950/80 px-4 py-1.5 text-xs font-medium text-cyan-200 shadow-[0_0_25px_rgba(34,211,238,0.45)] transition hover:border-cyan-300 hover:text-cyan-50 hover:shadow-[0_0_35px_rgba(34,211,238,0.8)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-cyan-400/80 disabled:hover:text-cyan-200 disabled:hover:shadow-[0_0_25px_rgba(34,211,238,0.45)]"
          >
            {hasKey ? "Atualizar chave" : "Usar esta chave"}
          </button>}
          {hasKey && !isEditMode && (
            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-cyan-500/70 hover:text-cyan-200"
            >
              Editar
            </button>
          )}
          {hasKey && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-fuchsia-500/70 hover:text-fuchsia-200"
            >
              Limpar
            </button>
          )}
        </div>
        <p className="text-[0.65rem] text-slate-500">
          A chave é usada apenas localmente para consultar a API do Clockify.
        </p>
      </form>
    </div>
  );
}
