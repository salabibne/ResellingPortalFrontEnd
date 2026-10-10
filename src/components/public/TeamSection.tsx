"use client";

import React from "react";
import { Users, Quote, Sparkles } from "lucide-react";
import { useCMSStore } from "@/store/useCMSStore";

export default function TeamSection() {
  const team = useCMSStore((state) => state.team);
  const loading = useCMSStore((state) => state.loading && !state.initialized);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <span className="loading loading-spinner loading-md text-primary"></span>
      </div>
    );
  }

  // If no team members exist, do not render an empty section
  if (!team || team.length === 0) return null;

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-base-100 via-base-200/40 to-base-100 border-t border-b border-base-200">
      <div className="max-w-7xl mx-auto">
        {/* Section Header Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Users size={14} /> Our Dedicated Team
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">
            Meet The Minds Behind Aarham
          </h2>
          <p className="text-base-content/70 text-sm sm:text-base md:text-lg leading-relaxed">
            Passionate visionaries, dedicated designers, and experienced leaders committed to delivering exceptional craftsmanship.
          </p>
        </div>

        {/* 4 Cards Per Row Grid on Large Screens, 2 on Tablet, 1 on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, idx) => (
            <div
              key={member.id || idx}
              className="bg-base-100 rounded-2xl p-5 sm:p-6 border border-base-300 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-indigo-500 to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div>
                {/* Profile Picture Container */}
                <div className="relative mb-4 sm:mb-5 flex justify-center">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300 shadow-md bg-base-200 shrink-0">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          // Fallback to avatar placeholder
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            member.name || "User"
                          )}&background=6366f1&color=fff&size=200`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-black text-2xl">
                        {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Name & Designation */}
                <div className="text-center mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-base-content group-hover:text-primary transition-colors">
                    {member.name}
                  </h3>
                  <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {member.designation}
                  </div>
                </div>

                {/* Message / Bio Quote Card */}
                <div className="relative bg-base-200/60 rounded-xl p-3.5 sm:p-4 border border-base-300/60 mt-2">
                  <Quote
                    size={18}
                    className="text-primary/40 absolute -top-2.5 -left-2.5 bg-base-100 rounded-full p-0.5 border border-base-300 shadow-xs"
                  />
                  <p className="text-xs sm:text-sm text-base-content/80 italic leading-relaxed pt-1">
                    &ldquo;{member.message}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
