"use client";

import {
  AlertTriangle,
  Eye,
  RotateCcw,
  Save,
  Send,
  Undo2,
} from "lucide-react";

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
  onShowPreview: () => void;
}

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
  onShowPreview,
}: BuilderTopBarProps) {
  const busy = saving || publishing || discarding || resetting;

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 text-white shadow-xl sm:p-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-indigo-400">
          Homepage builder
        </p>
        <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Manage sections, designs and content
        </h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
          <span>Draft workspace — the live site only changes when you publish.</span>
          {dirtyCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 font-bold text-amber-200">
              <AlertTriangle size={11} /> {dirtyCount} unsaved
            </span>
          )}
          {dirtyCount === 0 && hasUnpublishedChanges && (
            <span className="rounded-full bg-indigo-400/20 px-2 py-0.5 font-bold text-indigo-200">
              Draft differs from live
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onShowPreview}
          className="btn btn-xs btn-outline gap-1 border-white/30 text-white hover:bg-white/10 sm:btn-sm"
        >
          <Eye size={13} /> Preview
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={busy}
          className="btn btn-xs btn-ghost gap-1 text-slate-300 hover:text-white sm:btn-sm"
          title="Restore the factory section layout as a draft"
        >
          {resetting ? <span className="loading loading-spinner loading-xs" /> : <RotateCcw size={13} />}
          Reset
        </button>
        <button
          type="button"
          onClick={onDiscard}
          disabled={busy}
          className="btn btn-xs btn-ghost gap-1 text-slate-300 hover:text-white sm:btn-sm"
          title="Delete the draft and reload the published version"
        >
          {discarding ? <span className="loading loading-spinner loading-xs" /> : <Undo2 size={13} />}
          Discard
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={busy || dirtyCount === 0}
          className="btn btn-xs btn-outline gap-1 border-white/30 text-white hover:bg-white/10 sm:btn-sm"
        >
          {saving ? <span className="loading loading-spinner loading-xs" /> : <Save size={13} />}
          Save draft
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={busy}
          className="btn btn-xs btn-primary gap-1 font-bold shadow-md shadow-primary/30 sm:btn-sm"
        >
          {publishing ? <span className="loading loading-spinner loading-xs" /> : <Send size={13} />}
          Publish
        </button>
      </div>
    </div>
  );
}
