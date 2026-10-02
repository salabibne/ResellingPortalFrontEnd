"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface HomeCustomBannerProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function HomeCustomBanner({
  title,
  subtitle,
  description,
  imageUrl,
  buttonText,
  buttonLink,
}: HomeCustomBannerProps) {
  return (
    <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-white/10 p-6 sm:p-10 md:p-14">
        {/* Optional background image overlay */}
        {imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        )}

        <div className="relative z-10 max-w-2xl space-y-4">
          {subtitle && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={12} />
              <span>{subtitle}</span>
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight">
            {title}
          </h2>

          {description && (
            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
              {description}
            </p>
          )}

          {buttonText && (
            <div className="pt-2">
              <Link
                href={buttonLink || "/shop"}
                className="btn btn-primary btn-md sm:btn-lg rounded-2xl font-black gap-2 shadow-lg shadow-primary/30"
              >
                <span>{buttonText}</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
