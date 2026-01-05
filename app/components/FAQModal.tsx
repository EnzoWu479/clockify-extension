"use client";

import { useEffect } from "react";
import { FAQ_ITEMS } from "@/src/constants/faq";

type FAQModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function FAQModal({ isOpen, onClose }: FAQModalProps) {
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categorizedFAQ = {
    "getting-started": FAQ_ITEMS.filter((item) => item.category === "getting-started").sort((a, b) => a.order - b.order),
    features: FAQ_ITEMS.filter((item) => item.category === "features").sort((a, b) => a.order - b.order),
    troubleshooting: FAQ_ITEMS.filter((item) => item.category === "troubleshooting").sort((a, b) => a.order - b.order),
  };

  const categoryLabels = {
    "getting-started": "Primeiros Passos",
    features: "Funcionalidades",
    troubleshooting: "Solução de Problemas",
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-slate-100">
              Perguntas Frequentes
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Fechar"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6 space-y-6">
            {(Object.keys(categorizedFAQ) as Array<keyof typeof categorizedFAQ>).map((category) => {
              const items = categorizedFAQ[category];
              if (items.length === 0) return null;

              return (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">
                    {categoryLabels[category]}
                  </h3>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="bg-slate-800/50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-slate-200 mb-2">
                          {item.question}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
