"use client";

import Link from "next/link";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import { useResellerProfileStore } from "@/store/useResellerProfileStore";

interface VerifyBadgeProps {
  /** "chip" = pill with text, "dot" = small status light for an avatar corner. */
  variant?: "chip" | "dot" | "inline";
  /** Chip colours for a dark (teal hero) background. */
  onDark?: boolean;
  className?: string;
}

/**
 * Green "ভেরিফাইড" light once every required profile field is filled;
 * otherwise a red "ভেরিফাই করুন" link to the profile page.
 */
export default function VerifyBadge({ variant = "chip", onDark = false, className = "" }: VerifyBadgeProps) {
  const profile = useResellerProfileStore((state) => state.profile);
  if (!profile) return null;
  const verified = profile.verification?.isVerified;

  if (variant === "dot") {
    return (
      <Link
        href="/reseller/profile"
        title={verified ? "ভেরিফাইড" : "ভেরিফাই করুন"}
        aria-label={verified ? "ভেরিফাইড" : "ভেরিফাই করুন"}
        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow ${
          verified ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
        } ${className}`}
      >
        {verified ? <BadgeCheck size={14} /> : <ShieldAlert size={13} />}
      </Link>
    );
  }

  if (variant === "inline") {
    return verified ? (
      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        ভেরিফাইড উদ্যোক্তা
      </span>
    ) : (
      <Link
        href="/reseller/profile"
        className={`inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:underline ${className}`}
      >
        <ShieldAlert size={12} /> ভেরিফাই করুন
      </Link>
    );
  }

  if (verified) {
    return (
      <Link
        href="/reseller/profile"
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
          onDark ? "bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/50" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
        } ${className}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <BadgeCheck size={13} /> ভেরিফাইড
      </Link>
    );
  }

  return (
    <Link
      href="/reseller/profile"
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
        onDark ? "bg-rose-500 text-white shadow" : "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
      } ${className}`}
    >
      <ShieldAlert size={13} /> ভেরিফাই করুন
    </Link>
  );
}
