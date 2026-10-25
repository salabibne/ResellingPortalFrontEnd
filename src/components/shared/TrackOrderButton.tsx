"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, PackageSearch, X } from "lucide-react";
import { orderApi, type PublicTrackingResult } from "@/services/order.api";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "badge-warning",
  CONFIRMED: "badge-info",
  PROCESSING: "badge-info",
  SHIPPED: "badge-primary",
  DELIVERED: "badge-success",
  CANCELLED: "badge-error",
  RETURNED: "badge-neutral",
};

export default function TrackOrderButton() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublicTrackingResult | null>(null);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = code.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await orderApi.trackOrder(trimmed);
      setResult(data);
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Could not find that tracking code.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex items-center">
      {open && (
        <div
          className="absolute bottom-full right-0 mb-3 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-base-200 bg-base-100 p-3 shadow-2xl"
          role="dialog"
          aria-label="Track your order"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <h3 className="text-xs font-extrabold">Track your order</h3>
              <p className="text-[10px] text-base-content/50">
                Enter the order reference or courier tracking code.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-ghost btn-xs btn-circle"
              aria-label="Close tracking"
            >
              <X size={12} />
            </button>
          </div>

          <form onSubmit={submit} className="flex gap-1.5">
            <input
              ref={inputRef}
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="e.g. AAR-000123"
              className="input input-bordered input-sm w-full text-xs"
              aria-label="Tracking code"
            />
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="btn btn-sm btn-primary shrink-0"
            >
              {loading ? <span className="loading loading-spinner loading-xs" /> : "Track"}
            </button>
          </form>

          {error && (
            <p className="mt-2 rounded-lg bg-error/10 p-2 text-[10px] font-semibold text-error">
              {error}
            </p>
          )}

          {result && (
            <div className="mt-2 space-y-1.5 rounded-xl bg-base-200/60 p-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold">
                  {result.orderRef || "Order"}
                </span>
                <span
                  className={`badge badge-xs ${
                    STATUS_STYLES[result.processingStatus] || "badge-neutral"
                  }`}
                >
                  {result.processingStatus}
                </span>
              </div>
              {result.courierStatus && (
                <p className="text-[10px] text-base-content/60">
                  Courier: <strong>{result.courierStatus}</strong>
                </p>
              )}
              <p className="text-[10px] text-base-content/50">
                Updated {new Date(result.updatedAt).toLocaleString()}
              </p>
              {result.courierTrackingLink && (
                <a
                  href={result.courierTrackingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-primary underline"
                >
                  Open courier tracking <ExternalLink size={10} />
                </a>
              )}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label="Track your order"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-content shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 sm:h-14 sm:w-14 motion-reduce:transition-none"
      >
        <PackageSearch size={22} />
      </button>
    </div>
  );
}
