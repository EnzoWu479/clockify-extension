"use client";

import { useState, useRef, useEffect } from "react";

type HelpMenuProps = {
  onRestartTour: () => void;
  onOpenFAQ: () => void;
};

export function HelpMenu({ onRestartTour, onOpenFAQ }: HelpMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  function handleRestartTour() {
    setIsOpen(false);
    onRestartTour();
  }

  function handleOpenFAQ() {
    setIsOpen(false);
    onOpenFAQ();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors"
        aria-label="Menu de Ajuda"
        title="Ajuda"
      >
        <span className="text-sm font-bold">?</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
          <div className="py-1">
            <button
              onClick={handleRestartTour}
              className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 transition-colors"
            >
              🔄 Reiniciar Tour
            </button>
            <button
              onClick={handleOpenFAQ}
              className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 transition-colors"
            >
              ❓ FAQ
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 text-left text-sm text-slate-400 hover:bg-slate-700 transition-colors"
            >
              ⌨️ Atalhos (em breve)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
