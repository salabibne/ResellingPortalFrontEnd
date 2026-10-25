"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Smartphone, RefreshCw } from "lucide-react";
import type { HomepageConfig } from "@/components/homepage/types";
import HomepageRenderer from "@/components/homepage/HomepageRenderer";

interface LivePreviewProps {
  config: HomepageConfig;
  selectedId: string | null;
  newIds: string[];
  onSelect: (id: string) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function LivePreview({
  config,
  selectedId,
  newIds,
  onSelect,
  loading,
  error,
  onRetry,
}: LivePreviewProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!selectedId || !containerRef.current) return;
    const node = containerRef.current.querySelector<HTMLElement>(
      `[data-homepage-section="${selectedId}"]`,
    );
    node?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [selectedId]);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-base-200 bg-base-200/40">
      <div className="flex items-center justify-between border-b border-base-200 bg-base-100 p-2.5">
        <div>
          <h2 className="text-sm font-extrabold">Live preview</h2>
          <p className="text-[10px] text-base-content/50">
            Reflects unsaved edits · click a section to select it
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={`btn btn-xs ${viewport === "desktop" ? "btn-primary" : "btn-ghost"}`}
            aria-label="Desktop preview"
            aria-pressed={viewport === "desktop"}
          >
            <Monitor size={12} />
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={`btn btn-xs ${viewport === "mobile" ? "btn-primary" : "btn-ghost"}`}
            aria-label="Mobile preview"
            aria-pressed={viewport === "mobile"}
          >
            <Smartphone size={12} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="text-[11px] text-base-content/60">Loading homepage configuration…</p>
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center">
          <p className="text-xs font-semibold text-error">{error}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="btn btn-xs btn-primary gap-1">
              <RefreshCw size={12} /> Retry
            </button>
          )}
        </div>
      ) : config.sections.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center">
          <p className="text-xs font-semibold text-base-content/60">
            No sections yet. Add one from the library.
          </p>
        </div>
      ) : (
        <div ref={containerRef} className="flex-1 overflow-y-auto p-3">
          <div
            className={`mx-auto bg-base-100 shadow-lg transition-[width] duration-200 ${
              viewport === "mobile"
                ? "w-full max-w-[390px] overflow-x-hidden rounded-2xl border border-base-300"
                : "w-full overflow-x-hidden rounded-xl border border-base-300"
            }`}
          >
            <HomepageRenderer
              config={config}
              mode="edit"
              selectedId={selectedId}
              onSelect={onSelect}
              newSectionIds={newIds}
            />
          </div>
        </div>
      )}
    </div>
  );
}
