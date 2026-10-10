"use client";

import React from "react";
import Link from "next/link";
import { useCMSStore } from "@/store/useCMSStore";

function getYouTubeEmbedUrl(url: string): string {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
}

export default function AboutSection() {
  const about = useCMSStore((state) => state.about);
  const loading = useCMSStore((state) => state.loading && !state.initialized);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!about) return null;

  const embedUrl = getYouTubeEmbedUrl(about.youtubeLink);

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 md:px-8 bg-base-100 border-b border-base-200">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Content Column */}
        <div className="flex-1 text-left">
          <span className="badge badge-primary badge-outline text-xs uppercase font-semibold tracking-wider mb-3">
            About Us
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-base-content mb-4 sm:mb-6 leading-tight">
            {about.title || "About Aarham Apparel"}
          </h2>
          <p className="text-base-content/80 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed whitespace-pre-line">
            {about.description}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            {about.buttonText1 && (
              <Link href={about.buttonLink1 || "/about"} className="btn btn-primary rounded-full px-6 sm:px-8 w-full sm:w-auto text-center justify-center">
                {about.buttonText1}
              </Link>
            )}
            {about.buttonText2 && (
              <Link href={about.buttonLink2 || "#"} className="btn btn-outline rounded-full px-6 sm:px-8 w-full sm:w-auto text-center justify-center">
                {about.buttonText2}
              </Link>
            )}
          </div>
        </div>

        {/* Video Embed Column */}
        {embedUrl && (
          <div className="flex-1 w-full rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video relative">
            <iframe
              src={embedUrl}
              title={about.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </section>
  );
}
