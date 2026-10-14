"use client";

import React from "react";
import Link from "next/link";
import { useCMSStore } from "@/store/useCMSStore";

interface AboutSectionProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  content?: Record<string, any>;
}

function getYouTubeEmbedUrl(url: string): string {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
}

export default function AboutSection({
  title: overrideTitle,
  description: overrideDescription,
  imageUrl: overrideImageUrl,
  buttonText: overrideButtonText,
  buttonLink: overrideButtonLink,
  content,
}: AboutSectionProps) {
  const about = useCMSStore((state) => state.about);
  const loading = useCMSStore((state) => state.loading && !state.initialized);

  // Use customizer data when provided, otherwise fall back to CMS data
  const title = overrideTitle || about?.title || "About Aarham Apparel";
  const description = overrideDescription || about?.description || "";
  const youtubeLink = content?.youtubeLink || about?.youtubeLink || "";
  const buttonText1 = overrideButtonText || content?.buttonText1 || about?.buttonText1 || "Read Full Story";
  const buttonLink1 = overrideButtonLink || content?.buttonLink1 || about?.buttonLink1 || "/about";
  const buttonText2 = content?.buttonText2 || about?.buttonText2 || "";
  const buttonLink2 = content?.buttonLink2 || about?.buttonLink2 || "#";

  if (loading) {
    return (
      <div className="py-16 text-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(youtubeLink);

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 md:px-8 bg-base-100 border-b border-base-200">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Content Column */}
        <div className="flex-1 text-left">
          <span className="badge badge-primary badge-outline text-xs uppercase font-semibold tracking-wider mb-3">
            About Us
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-base-content mb-4 sm:mb-6 leading-tight">
            {title}
          </h2>
          <p className="text-base-content/80 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed whitespace-pre-line">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            {buttonText1 && (
              <Link href={buttonLink1} className="btn btn-primary rounded-full px-6 sm:px-8 w-full sm:w-auto text-center justify-center">
                {buttonText1}
              </Link>
            )}
            {buttonText2 && (
              <Link href={buttonLink2} className="btn btn-outline rounded-full px-6 sm:px-8 w-full sm:w-auto text-center justify-center">
                {buttonText2}
              </Link>
            )}
          </div>
        </div>

        {/* Video Embed Column */}
        {embedUrl && (
          <div className="flex-1 w-full rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video relative">
            <iframe
              src={embedUrl}
              title={title}
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
