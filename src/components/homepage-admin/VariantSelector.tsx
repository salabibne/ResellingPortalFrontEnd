"use client";

import type { HomepageSection } from "@/components/homepage/types";
import { getSectionDefinition } from "@/components/homepage/registry";
import VariantThumb from "./VariantThumb";

interface VariantSelectorProps {
  section: HomepageSection;
  onChange: (variant: string) => void;
}

export default function VariantSelector({ section, onChange }: VariantSelectorProps) {
  const definition = getSectionDefinition(section.type);

  if (!definition) {
    return (
      <p className="rounded-xl border border-dashed border-warning/50 bg-warning/10 p-3 text-[11px] font-semibold text-warning-content">
        This section type no longer has a supported design. Replace or delete it.
      </p>
    );
  }

  return (
    <div className="space-y-2 rounded-2xl border border-base-200 bg-base-100 p-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-black uppercase tracking-wider text-base-content/50">
          Design variant
        </h4>
        <span className="text-[10px] text-base-content/40">
          {definition.variants.length} options
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {definition.variants.map((variant) => {
          const selected = section.variant === variant.id;
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onChange(variant.id)}
              className={`rounded-xl border p-1.5 text-left transition-colors ${
                selected
                  ? "border-primary bg-primary/5"
                  : "border-base-200 hover:border-primary/40 hover:bg-base-200/60"
              }`}
              aria-pressed={selected}
            >
              <VariantThumb type={section.type} variant={variant.id} />
              <span className="mt-1 block truncate text-[11px] font-bold">{variant.label}</span>
              <span className="block truncate text-[9px] text-base-content/50">
                {variant.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
