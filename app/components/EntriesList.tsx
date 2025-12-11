"use client";

type EntryListItem = {
  id: string;
  description: string;
  projectName?: string;
  durationLabel: string;
  intervalLabel: string;
};

type EntriesListProps = {
  hasKey: boolean;
  isLoading: boolean;
  error: string | null;
  entries: EntryListItem[];
};

export function EntriesList({
  hasKey,
  isLoading,
  error,
  entries,
}: EntriesListProps) {
  return (
    <>
      {error && (
        <p className="mt-2 text-[0.7rem] text-rose-400">
          {error}
        </p>
      )}
      <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/40 p-3 text-xs text-slate-300">
        {!hasKey ? (
          <div className="flex h-32 items-center justify-center text-slate-600">
            Insira a API key para habilitar a lista.
          </div>
        ) : isLoading ? (
          <div className="flex h-32 items-center justify-center text-slate-400">
            Carregando time entries do Clockify...
          </div>
        ) : entries.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-slate-500">
            Nenhuma time entry encontrada para esta data.
          </div>
        ) : (
          <ul className="max-h-64 space-y-1 overflow-auto pr-1 text-[0.75rem]">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-slate-800/70 bg-slate-950/60 px-3 py-2 hover:border-cyan-400/60 hover:bg-slate-900/80"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-slate-100">
                    {entry.description || (
                      <span className="text-slate-500">
                        Sem descrição
                      </span>
                    )}
                  </span>
                  {entry.projectName && (
                    <span className="text-[0.65rem] text-cyan-300">
                      {entry.projectName}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 text-[0.65rem] text-slate-300">
                  <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-slate-100">
                    {entry.durationLabel}
                  </span>
                  <span className="text-slate-500">
                    {entry.intervalLabel}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
