"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import type { HomepageSection } from "@/components/homepage/types";
import { getSectionDefinition } from "@/components/homepage/registry";

interface SectionListProps {
  sections: HomepageSection[];
  selectedId: string | null;
  newIds: string[];
  pendingId: string | null;
  onSelect: (id: string) => void;
  onToggle: (section: HomepageSection) => void;
  onDuplicate: (section: HomepageSection) => void;
  onDelete: (section: HomepageSection) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onReorder: (sourceId: string, targetId: string) => void;
  onAdd: () => void;
}

export default function SectionList({
  sections,
  selectedId,
  newIds,
  pendingId,
  onSelect,
  onToggle,
  onDuplicate,
  onDelete,
  onMove,
  onReorder,
  onAdd,
}: SectionListProps) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-base-200 bg-base-100">
      <div className="flex items-center justify-between border-b border-base-200 p-3">
        <div>
          <h2 className="text-sm font-extrabold">Sections</h2>
          <p className="text-[10px] text-base-content/50">{sections.length} configured</p>
        </div>
        <button type="button" onClick={onAdd} className="btn btn-xs btn-primary gap-1">
          <Plus size={12} /> Add
        </button>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto p-2">
        {sections.length === 0 && (
          <div className="rounded-xl border border-dashed border-base-300 p-6 text-center">
            <p className="text-[11px] font-semibold text-base-content/60">No sections yet.</p>
            <button type="button" onClick={onAdd} className="btn btn-xs btn-primary mt-2">
              Add your first section
            </button>
          </div>
        )}

        {sections.map((section, index) => {
          const definition = getSectionDefinition(section.type);
          const variantLabel =
            definition?.variants.find((variant) => variant.id === section.variant)?.label ||
            section.variant;
          const selected = selectedId === section.id;
          const busy = pendingId === section.id;

          return (
            <div
              key={section.id}
              draggable
              onDragStart={(event) => {
                setDragId(section.id);
                event.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setOverId(section.id);
              }}
              onDragLeave={() =>
                setOverId((current) => (current === section.id ? null : current))
              }
              onDrop={(event) => {
                event.preventDefault();
                if (dragId && dragId !== section.id) onReorder(dragId, section.id);
                setDragId(null);
                setOverId(null);
              }}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
              onClick={() => onSelect(section.id)}
              className={`rounded-xl border p-2 transition-colors ${
                selected
                  ? "border-primary bg-primary/5"
                  : overId === section.id
                  ? "border-primary/60 bg-base-200"
                  : "border-base-200 hover:border-base-300"
              } ${!section.isEnabled ? "opacity-60" : ""}`}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(section.id);
                }
              }}
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 cursor-grab text-base-content/30" aria-hidden="true">
                  <GripVertical size={14} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-base-200 px-1 py-0.5 font-mono text-[9px] font-bold text-base-content/60">
                      #{index + 1}
                    </span>
                    <span className="truncate text-[11px] font-bold">
                      {section.title || definition?.label || section.type}
                    </span>
                    {newIds.includes(section.id) && (
                      <span className="badge badge-xs badge-success text-white">new</span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[9px] uppercase tracking-wider text-base-content/50">
                    {definition?.label || section.type} · {variantLabel}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <div className="flex">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onMove(section.id, "up");
                      }}
                      disabled={index === 0 || busy}
                      className="btn btn-ghost btn-xs btn-circle"
                      aria-label="Move section up"
                    >
                      <ArrowUp size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onMove(section.id, "down");
                      }}
                      disabled={index === sections.length - 1 || busy}
                      className="btn btn-ghost btn-xs btn-circle"
                      aria-label="Move section down"
                    >
                      <ArrowDown size={11} />
                    </button>
                  </div>
                  <div className="flex">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggle(section);
                      }}
                      disabled={busy}
                      className={`btn btn-ghost btn-xs btn-circle ${
                        section.isEnabled ? "text-success" : "text-base-content/40"
                      }`}
                      aria-label={section.isEnabled ? "Hide section" : "Show section"}
                    >
                      {section.isEnabled ? <Eye size={11} /> : <EyeOff size={11} />}
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDuplicate(section);
                      }}
                      disabled={busy}
                      className="btn btn-ghost btn-xs btn-circle"
                      aria-label="Duplicate section"
                    >
                      <Copy size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(section);
                      }}
                      disabled={busy}
                      className="btn btn-ghost btn-xs btn-circle text-error"
                      aria-label="Delete section"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
              {busy && (
                <span className="mt-1 block text-[9px] font-semibold text-primary">Working…</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
