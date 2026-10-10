"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useCMSStore } from "@/store/useCMSStore";

export default function HeroSection() {
  const hero = useCMSStore((state) => state.hero);
  const loading = useCMSStore((state) => state.loading && !state.initialized);

  // Fallback defaults if no CMS data exists
  const title = hero?.heroTitle || "Style Meets Substance";
  const subtitle =
    hero?.heroSubtitle ||
    "Discover the latest trends in apparel. Our exclusive collection brings you the finest quality clothing designed for comfort and elegance.";
  const btn1Text = hero?.buttonText1 || "Shop Collection";
  const btn1Link = hero?.buttonLink1 || "/shop";
  const btn2Text = hero?.buttonText2 || "Explore Categories";
  const btn2Link = hero?.buttonLink2 || "/about";
  const image = hero?.imageUrl || "/api/image?name=hero";

  if (loading) {
    return (
      <div className="hero bg-base-200 py-20 flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="hero bg-base-200 relative overflow-hidden transition-all duration-300">
      <div className="hero-content flex-col lg:flex-row-reverse w-full py-10 sm:py-16 px-4 sm:px-6 md:px-8 gap-8 lg:gap-12 max-w-7xl mx-auto">
        <div className="flex-1 w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-2xl relative aspect-video sm:aspect-[4/3] max-h-[460px]">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover rounded-2xl hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/api/image?name=hero";
            }}
          />
        </div>
        <div className="flex-1 text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-base-content mb-4 sm:mb-6 leading-tight">
            {title}
          </h1>
          <p className="py-2 sm:py-4 text-sm sm:text-base md:text-lg text-base-content/80 mb-6 sm:mb-8 leading-relaxed">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {btn1Text && (
              <Link href={btn1Link} className="btn btn-primary btn-md sm:btn-lg gap-2 rounded-full px-6 sm:px-8 w-full sm:w-auto justify-center">
                {btn1Text} <ChevronRight size={18} />
              </Link>
            )}
            {btn2Text && (
              <Link href={btn2Link} className="btn btn-outline btn-md sm:btn-lg rounded-full px-6 sm:px-8 w-full sm:w-auto justify-center">
                {btn2Text}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
