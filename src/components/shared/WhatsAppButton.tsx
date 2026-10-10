"use client";

import React, { useState, useEffect } from "react";
import { useCMSStore } from "@/store/useCMSStore";

/**
 * Formats a raw WhatsApp input (phone number, username, or link) into a valid wa.me URL
 */
export function formatWhatsAppUrl(rawInput?: string | null): string {
  const fallback = "01701474332";
  const input = (rawInput && rawInput.trim()) || fallback;

  // Case 1: Full URL already provided
  if (input.startsWith("http://") || input.startsWith("https://")) {
    return input;
  }
  if (input.startsWith("wa.me/")) {
    return `https://${input}`;
  }

  // Case 2: Number with leading '+' or country code
  let cleaned = input.replace(/[\s\-\(\)]/g, "");

  // If local Bangladesh number starting with 01 (11 digits: e.g. 01701474332)
  if (/^01[3-9]\d{8}$/.test(cleaned)) {
    cleaned = `88${cleaned}`;
  } else if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // Case 3: If only digits, use as wa.me phone
  if (/^\d+$/.test(cleaned)) {
    return `https://wa.me/${cleaned}?text=${encodeURIComponent(
      "Hello Aarham Apparel, I would like to inquire about your products."
    )}`;
  }

  // Case 4: Username or handle
  const cleanUsername = input.replace(/^@/, "");
  return `https://wa.me/${cleanUsername}`;
}

export default function WhatsAppButton() {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const contactInfo = useCMSStore((state) => state.contactInfo);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const rawWhatsapp = contactInfo?.whatsapp || "01701474332";
  const whatsappUrl = formatWhatsAppUrl(rawWhatsapp);

  return (
    <div
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50 flex items-center print:hidden select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Desktop / Tablet Expanded Label Pill on Hover */}
      <div
        className={`hidden sm:flex items-center gap-2 mr-3 bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold px-3.5 py-2 rounded-full shadow-lg border border-slate-200/80 transition-all duration-300 origin-right ${
          isHovered
            ? "opacity-100 translate-x-0 scale-100"
            : "opacity-0 translate-x-4 scale-95 pointer-events-none"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>Chat with us</span>
      </div>

      {/* WhatsApp Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Aarham Apparel on WhatsApp"
        className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-lg shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-110 active:scale-95 focus:outline-hidden focus:ring-4 focus:ring-emerald-400/30"
      >
        {/* Soft Pulse Background Ping */}
        <span className="absolute -inset-0.5 rounded-full bg-[#25D366] opacity-30 animate-pulse group-hover:opacity-0 transition-opacity"></span>

        {/* WhatsApp Official Vector Icon */}
        <svg
          className="w-7 h-7 sm:w-8 sm:h-8 fill-current relative z-10 transition-transform duration-300 group-hover:scale-105"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.507 14.307l-.009.075c-.239.004-.76.012-1.353-.298-.445-.23-1.049-.553-1.89-1.01-.22-.12-.41-.18-.58-.02-.24.23-.93.99-1.14 1.18-.21.19-.36.21-.6.09-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.58-1.4-.8-1.92-.21-.51-.43-.44-.59-.45-.15-.01-.32-.01-.49-.01-.17 0-.45.06-.69.32-.24.26-.91.89-.91 2.17 0 1.28.93 2.52 1.06 2.7.13.18 1.83 2.8 4.43 3.92.62.27 1.1.43 1.48.55.62.2 1.19.17 1.64.1.5-.07 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.11-.23-.17-.47-.28zM12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.16c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.83-1.26-4.39 0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.83c0 4.54-3.7 8.24-8.25 8.24z" />
        </svg>

        {/* Small Active Badge Dot */}
        <span className="absolute top-0 right-0 -mt-0.5 -mr-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
      </a>
    </div>
  );
}
