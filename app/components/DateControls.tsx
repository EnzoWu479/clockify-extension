"use client";

type DateControlsProps = {
  selectedDate: string;
  onSelectedDateChange: (value: string) => void;
  onChangeDate: (offsetDays: number) => void;
  onReload: () => void;
  hasKey: boolean;
  isLoading: boolean;
};

export function DateControls({
  selectedDate,
  onSelectedDateChange,
  onChangeDate,
  onReload,
  hasKey,
  isLoading,
}: DateControlsProps) {
  return (
    <div className="mt-3 flex flex-col gap-2 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <label
          htmlFor="date"
          className="text-[0.7rem] uppercase tracking-wide text-slate-500"
        >
          Data
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChangeDate(-1)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-950/70 text-[0.7rem] text-slate-300 hover:border-cyan-400 hover:text-cyan-200"
            title="Dia anterior"
          >
            -
          </button>
          <input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(event) => onSelectedDateChange(event.target.value)}
            className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
          <button
            type="button"
            onClick={() => onChangeDate(1)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-950/70 text-[0.7rem] text-slate-300 hover:border-cyan-400 hover:text-cyan-200"
            title="Próximo dia"
          >
            +
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={onReload}
        disabled={!hasKey || isLoading}
        className="inline-flex items-center justify-center rounded-full border border-cyan-400/70 bg-slate-950/60 px-4 py-1.5 text-xs font-medium text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.3)] transition hover:border-cyan-300 hover:text-cyan-100 hover:shadow-[0_0_30px_rgba(34,211,238,0.7)] disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500 disabled:shadow-none"
      >
        {isLoading ? "Carregando..." : "Carregar do Clockify"}
      </button>
    </div>
  );
}
