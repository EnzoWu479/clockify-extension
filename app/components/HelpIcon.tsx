"use client";

type HelpIconProps = {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
};

export function HelpIcon({ onClick, className = '' }: HelpIconProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-slate-100 transition-colors ${className}`}
      aria-label="Ajuda"
      title="Clique para ver ajuda"
    >
      <span className="text-xs font-bold">?</span>
    </button>
  );
}
