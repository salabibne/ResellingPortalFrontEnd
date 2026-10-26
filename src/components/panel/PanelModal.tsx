"use client";

import { ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";

type PanelModalSize = "sm" | "md" | "lg";

interface PanelModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: PanelModalSize;
  footer?: ReactNode;
  children: ReactNode;
}

const SIZES: Record<PanelModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export default function PanelModal({
  open,
  onClose,
  title,
  size = "md",
  footer,
  children,
}: PanelModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    previousFocus.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);

    const raf = window.requestAnimationFrame(() => {
      const focusable = panelRef.current?.querySelector<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      (focusable ?? panelRef.current)?.focus();
    });

    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative w-full ${SIZES[size]} bg-base-100 rounded-t-2xl rounded-b-none sm:rounded-2xl shadow-2xl border border-base-200 max-h-[90vh] flex flex-col animate-scale-in focus:outline-none`}
      >
        {title && (
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-base-200">
            <h2 className="text-lg font-bold text-base-content truncate">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-square rounded-xl shrink-0"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-base-200 px-4 sm:px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
