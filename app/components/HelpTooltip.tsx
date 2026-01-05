"use client";

import { useFloating, offset, flip, shift } from '@floating-ui/react';
import type { HelpContent } from '@/src/domain/tour';

type HelpTooltipProps = {
  content: HelpContent;
  anchorEl: HTMLElement | null;
  onClose: () => void;
};

export function HelpTooltip({ content, anchorEl, onClose }: HelpTooltipProps) {
  const { refs, floatingStyles } = useFloating({
    elements: {
      reference: anchorEl,
    },
    placement: 'bottom',
    middleware: [offset(10), flip(), shift()],
  });

  if (!anchorEl) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      />
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        className="z-50 max-w-sm p-4 bg-slate-800 border border-slate-700 rounded-lg shadow-xl"
      >
        <h3 className="text-sm font-semibold text-slate-100 mb-2">
          {content.title}
        </h3>
        <p className="text-xs text-slate-300 mb-2">
          {content.description}
        </p>
        {content.example && (
          <div className="p-2 bg-slate-900 rounded text-xs text-slate-400 font-mono mb-2">
            {content.example}
          </div>
        )}
        {content.relatedLinks && content.relatedLinks.length > 0 && (
          <div className="mt-3 space-y-1">
            {content.relatedLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-cyan-400 hover:text-cyan-300"
              >
                {link.label} →
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
