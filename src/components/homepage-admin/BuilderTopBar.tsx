"use client";

import { AlertTriangle, CheckCircle2, LayoutTemplate, RotateCcw, Save, Send, Undo2 } from "lucide-react";

interface BuilderTopBarProps {
  dirtyCount: number;
  hasUnpublishedChanges: boolean;
  saving: boolean;
  publishing: boolean;
  discarding: boolean;
  resetting: boolean;
  onSave: () => void;
  onPublish: () => void;
  onDiscard: () => void;
  onReset: () => void;
}

/** Slim editor toolbar, like a site editor's header: title and status left, actions right. */
export default function BuilderTopBar({
  dirtyCount,
  hasUnpublishedChanges,
  saving,
  publishing,
  discarding,
  resetting,
  onSave,
  onPublish,
  onDiscard,
  onReset,
}: BuilderTopBarProps) {
  const busy = saving || publishing || discarding || resetting;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-base-200 bg-base-100 px-3 py-2.5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LayoutTemplate size={18} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-base font-extrabold leading-tight">Homepage Builder</h1>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-base-content/60">
            {dirtyCount > 0 ? (
              <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                <AlertTriangle size={11} className="shrink-0" /> {dirtyCount} unsaved
              </span>
            ) : hasUnpublishedChanges ? (
              <span className="font-bold text-primary">Draft saved · not published</span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                <CheckCircle2 size={11} className="shrink-0" /> Live is up to date
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
        <button
          type="button"
          onClick={onReset}
          disabled={busy}
          className="btn btn-sm btn-ghost rounded-xl gap-1.5 flex-nowrap whitespace-nowrap"
          title="Restore the factory section layout as a draft"
        >
          {resetting ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <RotateCcw size={15} className="shrink-0" />
          )}
          Reset
        </button>
        <button
          type="button"
          onClick={onDiscard}
          disabled={busy}
          className="btn btn-sm btn-ghost rounded-xl gap-1.5 flex-nowrap whitespace-nowrap"
          title="Delete the draft and reload the published version"
        >
          {discarding ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <Undo2 size={15} className="shrink-0" />
          )}
          Discard
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={busy || dirtyCount === 0}
          className="btn btn-sm btn-outline btn-primary rounded-xl gap-1.5 flex-nowrap whitespace-nowrap font-semibold"
        >
          {saving ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <Save size={15} className="shrink-0" />
          )}
          Save draft
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={busy}
          className="btn btn-sm btn-primary rounded-xl gap-1.5 flex-nowrap whitespace-nowrap text-white font-semibold"
        >
          {publishing ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <Send size={15} className="shrink-0" />
          )}
          Publish
        </button>
      </div>
    </div>
  );
}
