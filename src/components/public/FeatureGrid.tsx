"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  Sparkles,
  Zap,
  CheckCircle2,
  Star,
  Award,
  ArrowRight,
  Package,
} from "lucide-react";
import { useCMSStore } from "@/store/useCMSStore";

const ICON_MAP: Record<string, any> = {
  ShieldCheck,
  Truck,
  Sparkles,
  Zap,
  CheckCircle2,
  Star,
  Award,
  Package,
};

export default function FeatureGrid() {
  const features = useCMSStore((state) => state.features);
  const loading = useCMSStore((state) => state.loading && !state.initialized);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <span className="loading loading-spinner loading-md text-primary"></span>
      </div>
    );
  }

  if (features.length === 0) return null;

  const sectionTitle = features.find((f) => f.title)?.title || features[0]?.title || "Why Choose Us";
  const sectionDesc = features.find((f) => f.description)?.description || features[0]?.description || "Discover the premium features and quality craftsmanship of Aarham Apparel.";

  return (
    <section className="py-20 px-4 md:px-8 bg-base-200/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-base-content mb-4">
            {sectionTitle}
          </h2>
          <p className="text-base-content/70 text-base md:text-lg">
            {sectionDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, idx) => {
            const IconComponent = ICON_MAP[item.cardIcon] || Sparkles;
            return (
              <div
                key={item.id || idx}
                className="bg-base-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-base-300 flex flex-col justify-between group overflow-hidden"
              >
                {item.imageUrl && (
                  <div className="h-44 w-full overflow-hidden bg-base-200">
                    <img
                      src={item.imageUrl}
                      alt={item.cardTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <IconComponent size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-base-content mb-3">
                      {item.cardTitle}
                    </h3>
                    <p className="text-base-content/70 text-sm leading-relaxed mb-6">
                      {item.cardDescription}
                    </p>
                  </div>
                  {item.cardButton && item.cardLink && (
                    <Link
                      href={item.cardLink}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-focus transition-colors"
                    >
                      {item.cardButton} <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
