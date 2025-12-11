"use client";

type DaySummaryHeaderProps = {
  totalLabel: string;
  dateLabel: string;
  copyStatus: "idle" | "copied" | "error";
  canCopy: boolean;
  onCopy: () => void;
};

export function DaySummaryHeader({
  totalLabel,
  dateLabel,
  copyStatus,
  canCopy,
  onCopy,
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
        <button
          type="button"
          onClick={onCopy}
          disabled={!canCopy}
          className="inline-flex items-center justify-center rounded-full border border-fuchsia-500/80 bg-slate-950/60 px-4 py-1.5 text-[0.7rem] font-medium text-fuchsia-200 shadow-[0_0_16px_rgba(236,72,153,0.35)] transition hover:border-fuchsia-400 hover:text-fuchsia-100 hover:shadow-[0_0_24px_rgba(236,72,153,0.7)] disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500 disabled:shadow-none"
        >
          Copiar dia para Excel
        </button>
      </h2>
      <p className="mt-1 text-xs text-slate-500">{dateLabel}</p>
      {copyStatus === "copied" && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-emerald-400/70 bg-slate-900/95 px-4 py-2 text-xs text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.6)]">
          Texto copiado para a área de transferência.
        </div>
      )}
      {copyStatus === "error" && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-rose-400/70 bg-slate-900/95 px-4 py-2 text-xs text-rose-100 shadow-[0_0_25px_rgba(248,113,113,0.6)]">
          Não foi possível copiar automaticamente. Cole manualmente no Excel.
        </div>
      )}
    </>
  );
}
