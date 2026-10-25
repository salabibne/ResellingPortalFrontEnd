"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront error boundary:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-3 px-4 py-20 text-center">
      <span className="rounded-full bg-error/10 p-3 text-error">
        <AlertTriangle size={22} />
      </span>
      <h1 className="text-lg font-extrabold">Something went wrong</h1>
      <p className="text-xs text-base-content/60">
        This page could not be loaded. You can try again without refreshing, or head back to
        the shop.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={reset} className="btn btn-sm btn-primary gap-1">
          <RefreshCw size={13} /> Try again
        </button>
        <Link href="/shop" className="btn btn-sm btn-ghost">
          Back to shop
        </Link>
      </div>
    </div>
  );
}
