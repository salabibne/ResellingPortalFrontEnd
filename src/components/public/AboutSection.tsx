"use client";

import React from "react";
import Link from "next/link";
import { useCMSStore } from "@/store/useCMSStore";
import { safeLink } from "@/utils/links";

interface AboutSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  content?: Record<string, any>;
  /** false = never borrow CmsAbout values (homepage shows customizer data only) */
  useCmsFallback?: boolean;
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
  subtitle: overrideSubtitle,
  description: overrideDescription,
  imageUrl: overrideImageUrl,
  buttonText: overrideButtonText,
  buttonLink: overrideButtonLink,
  content,
  useCmsFallback = true,
}: AboutSectionProps) {
  const aboutFromCms = useCMSStore((state) => state.about);
  const loadingFromCms = useCMSStore((state) => state.loading && !state.initialized);

  const about = useCmsFallback ? aboutFromCms : null;
  const loading = useCmsFallback && loadingFromCms;

  // Use customizer data when provided, otherwise fall back to CMS data
  const badge = overrideSubtitle || "About Us";
  const title = overrideTitle || about?.title || "About Aarham Apparel";
  const description = overrideDescription || about?.description || "";
  const youtubeLink = content?.youtubeLink || about?.youtubeLink || "";
  const buttonText1 = overrideButtonText || content?.buttonText1 || about?.buttonText1 || "Read Full Story";
  const buttonLink1 = safeLink(overrideButtonLink || content?.buttonLink1 || about?.buttonLink1, "/about");
  const buttonText2 = content?.buttonText2 ?? about?.buttonText2 ?? "";
  const buttonLink2 = safeLink(content?.buttonLink2 ?? about?.buttonLink2, "/shop");

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
            {badge}
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

        {/* Media: YouTube embed first, otherwise the customizer banner image */}
        {embedUrl ? (
          <div className="flex-1 w-full rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video relative">
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : overrideImageUrl ? (
          <div className="flex-1 w-full rounded-2xl overflow-hidden shadow-2xl aspect-video bg-base-200">
            <img src={overrideImageUrl} alt={title} className="w-full h-full object-cover" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
