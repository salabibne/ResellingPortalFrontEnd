"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X, Megaphone, ExternalLink, Sparkles } from "lucide-react";
import noticeApi, { NoticeAudience, NoticeModal } from "@/services/notice.api";

interface NoticePopupModalProps {
  audience: NoticeAudience;
}

export default function NoticePopupModal({ audience }: NoticePopupModalProps) {
  const pathname = usePathname();
  const [notice, setNotice] = useState<NoticeModal | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    // Avoid showing on admin, dashboard, and auth screens
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/inventory") ||
      pathname.startsWith("/orders") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register")
    ) {
      return;
    }

    // Public modal should not show inside reseller portal
    if (audience === "PUBLIC" && pathname.startsWith("/reseller")) {
      return;
    }

    // Reseller modal should only show inside reseller portal
    if (audience === "RESELLER" && !pathname.startsWith("/reseller")) {
      return;
    }

    let isMounted = true;

    const fetchActiveNotice = async () => {
      try {
        const activeNotice = await noticeApi.getActive(audience);
        if (!isMounted || !activeNotice) return;

        // Check if user already dismissed this specific notice today
        const dismissalKey = `aarham_notice_dismissed_${activeNotice.id}`;
        const dismissedDate = localStorage.getItem(dismissalKey);
        const todayStr = new Date().toISOString().slice(0, 10);

        if (dismissedDate === todayStr) {
          return;
        }

        setNotice(activeNotice);
        // Small delay for smooth entry after page hydration
        const timer = setTimeout(() => {
          if (isMounted) {
            setIsOpen(true);
          }
        }, 600);

        return () => clearTimeout(timer);
      } catch (err) {
        console.error("Failed to load active notice popup:", err);
      }
    };

    fetchActiveNotice();

    return () => {
      isMounted = false;
    };
  }, [audience, pathname]);

  const handleClose = () => {
    if (notice) {
      const dismissalKey = `aarham_notice_dismissed_${notice.id}`;
      if (dontShowToday) {
        const todayStr = new Date().toISOString().slice(0, 10);
        localStorage.setItem(dismissalKey, todayStr);
      } else {
        // Dismiss for current browser session
        sessionStorage.setItem(dismissalKey, "dismissed");
      }
    }
    setIsOpen(false);
  };

  if (!isOpen || !notice) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={handleClose} />

      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 z-10 transition-all transform scale-100 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-modal-title"
      >
        {/* Floating Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all shadow-md backdrop-blur-xs"
          aria-label="Close notice modal"
        >
          <X size={18} />
        </button>

        {/* Optional Banner Image */}
        {notice.imageUrl && (
          <div className="relative w-full h-48 sm:h-56 bg-slate-100 overflow-hidden">
            <img
              src={notice.imageUrl}
              alt={notice.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Hide broken images gracefully
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        <div className="p-6 sm:p-7 space-y-4">
          {/* Badge & Target info */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-primary/10 text-primary border border-primary/20">
              <Megaphone size={13} />
              Notice
            </span>
            {audience === "RESELLER" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles size={11} /> Reseller Announcement
              </span>
            )}
          </div>

          {/* Title */}
          <h2
            id="notice-modal-title"
            className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight"
          >
            {notice.title}
          </h2>

          {/* Body Content */}
          <div className="text-sm text-slate-600 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-line pr-1 scrollbar-thin">
            {notice.content}
          </div>

          {/* Call to Action Button (if provided) */}
          {notice.buttonText && notice.buttonLink && (
            <div className="pt-2">
              <Link
                href={notice.buttonLink}
                onClick={handleClose}
                className="btn btn-primary w-full text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <span>{notice.buttonText}</span>
                <ExternalLink size={16} />
              </Link>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-xs rounded"
                checked={dontShowToday}
                onChange={(e) => setDontShowToday(e.target.checked)}
              />
              <span>Don&apos;t show again today</span>
            </label>

            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-700 font-semibold transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
