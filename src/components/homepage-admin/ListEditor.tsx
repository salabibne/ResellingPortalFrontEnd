"use client";

import type { ReactNode } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";

/** Repeating item editor used by the Homepage Builder section forms. */
export default function ListEditor({
  label,
  items,
  onChange,
  createItem,
  renderItem,
  addLabel,
  max = 12,
}: {
  label: string;
  items: Record<string, unknown>[];
  onChange: (items: Record<string, unknown>[]) => void;
  createItem: () => Record<string, unknown>;
  renderItem: (
    item: Record<string, unknown>,
    update: (patch: Record<string, unknown>) => void,
  ) => ReactNode;
  addLabel: string;
  max?: number;
}) {
  const update = (index: number, patch: Record<string, unknown>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold">{label}</span>
        <span className="text-[10px] text-base-content/50">{items.length}</span>
      </div>

      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-base-300 p-3 text-center text-[11px] text-base-content/50">
          Nothing added yet.
        </p>
      )}

      {items.map((item, index) => (
        <div key={index} className="space-y-1.5 rounded-xl border border-base-200 bg-base-100 p-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] font-bold text-base-content/50">
              <GripVertical size={12} /> #{index + 1}
            </span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="btn btn-ghost btn-xs text-error"
              aria-label="Remove item"
            >
              <Trash2 size={12} />
            </button>
          </div>
          {renderItem(item, (patch) => update(index, patch))}
        </div>
      ))}

      {items.length < max && (
        <button
          type="button"
          onClick={() => onChange([...items, createItem()])}
          className="btn btn-xs btn-outline w-full gap-1"
        >
          <Plus size={12} /> {addLabel}
        </button>
      )}
    </div>
  );
}
