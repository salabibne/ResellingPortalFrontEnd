"use client";

import { X, Plus } from "lucide-react";
import {
  SECTION_DEFINITIONS,
  type SectionDefinition,
} from "@/components/homepage/registry";
import type { HomepageSectionType } from "@/components/homepage/types";
import VariantThumb from "./VariantThumb";

interface SectionLibraryProps {
  open: boolean;
  adding: boolean;
  onClose: () => void;
  onAdd: (type: HomepageSectionType, variant: string) => void;
}

export default function SectionLibrary({
  open,
  adding,
  onClose,
  onAdd,
}: SectionLibraryProps) {
  if (!open) return null;

  const groups = SECTION_DEFINITIONS.reduce<Record<string, SectionDefinition[]>>(
    (accumulator, definition) => {
      accumulator[definition.category] = accumulator[definition.category] || [];
      accumulator[definition.category].push(definition);
      return accumulator;
    },
    {},
  );

  return (
    <div className="modal modal-open">
      <div className="modal-box relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl p-4 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold">Section library</h3>
            <p className="text-[11px] text-base-content/60">
              Pick a design variant. Each addition creates an independent section with its own
              content.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            aria-label="Close library"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-6">
          {Object.entries(groups).map(([category, definitions]) => (
            <div key={category}>
              <h4 className="mb-2 text-[11px] font-black uppercase tracking-wider text-base-content/50">
                {category}
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {definitions.map((definition) => (
                  <div
                    key={definition.type}
                    className="rounded-2xl border border-base-200 bg-base-100 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="text-sm font-extrabold">{definition.label}</h5>
                        <p className="mt-0.5 text-[10px] leading-snug text-base-content/60">
                          {definition.description}
                        </p>
                      </div>
                      <span className="badge badge-xs badge-ghost shrink-0">
                        {definition.variants.length}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                      {definition.variants.map((variant) => (
                        <button
                          key={variant.id}
                          type="button"
                          disabled={adding}
                          onClick={() => onAdd(definition.type, variant.id)}
                          className="group rounded-lg border border-base-200 p-1 text-left transition-colors hover:border-primary/40 hover:bg-base-200/60 disabled:opacity-50"
                        >
                          <VariantThumb type={definition.type} variant={variant.id} />
                          <span className="mt-1 flex items-center gap-1 text-[10px] font-bold leading-tight">
                            <Plus size={9} className="shrink-0 text-primary" />
                            <span className="truncate">{variant.label}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-action">
          <button type="button" onClick={onClose} className="btn btn-sm btn-ghost">
            Close
          </button>
        </div>
      </div>
      <button
        type="button"
        className="modal-backdrop"
        onClick={onClose}
        aria-label="Close library"
      />
    </div>
  );
}
