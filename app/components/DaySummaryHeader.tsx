"use client";

type DaySummaryHeaderProps = {
  totalLabel: string;
  dateLabel: string;
  canCopyProject: boolean;
  onCopyProject: () => void;
  canCopyRh: boolean;
  onCopyRh: () => void;
};

export function DaySummaryHeader({
  totalLabel,
  dateLabel,
  canCopyProject,
  onCopyProject,
  canCopyRh,
  onCopyRh,
}: DaySummaryHeaderProps) {
  return (
    <>
      <h2 className="flex flex-col gap-1 text-sm font-semibold text-slate-200 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span>This week</span>
          <span className="text-[0.7rem] font-normal text-slate-400">
            Total do dia:
            <span className="ml-1 font-semibold text-slate-100">
              {totalLabel}
            </span>
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onCopyProject}
            disabled={!canCopyProject}
            className="inline-flex items-center justify-center rounded-full border border-fuchsia-500/80 bg-slate-950/60 px-4 py-1.5 text-[0.7rem] font-medium text-fuchsia-200 shadow-[0_0_16px_rgba(236,72,153,0.35)] transition hover:border-fuchsia-400 hover:text-fuchsia-100 hover:shadow-[0_0_24px_rgba(236,72,153,0.7)] disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500 disabled:shadow-none"
          >
            Copiar para Planilha Projeto
          </button>
          <button
            type="button"
            onClick={onCopyRh}
            disabled={!canCopyRh}
            className="inline-flex items-center justify-center rounded-full border border-cyan-400/70 bg-slate-950/60 px-4 py-1.5 text-[0.7rem] font-medium text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.25)] transition hover:border-cyan-300 hover:text-cyan-50 hover:shadow-[0_0_24px_rgba(34,211,238,0.6)] disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500 disabled:shadow-none"
          >
            Copiar para RH
          </button>
        </div>
      </h2>
      <p className="mt-1 text-xs text-slate-500">{dateLabel}</p>
    </>
  );
 }
