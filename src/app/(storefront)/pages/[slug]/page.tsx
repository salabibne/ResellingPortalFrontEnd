import React from "react";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { getPublicPage, type PublicPageConfig } from "@/services/homepage.api";
import HomepageRenderer from "@/components/homepage/HomepageRenderer";
import LegacyPageSections from "@/components/public/LegacyPageSections";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

export const dynamic = "force-dynamic"; // Always show the latest published page

interface PageProps {
  params: {
    slug: string;
  };
}

async function loadPage(slug: string): Promise<PublicPageConfig | null> {
  // The home page is served by "/" from the Homepage Builder, never here.
  if (slug === "home") return null;
  try {
    return await getPublicPage(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const config = await loadPage(params.slug);
  if (!config) {
    return { title: "Page Not Found - Aarham Apparel" };
  }
  return {
    title: config.page.metaTitle || `${config.page.title} - Aarham Apparel`,
    description: config.page.metaDescription || config.page.title,
  };
}

export default async function PublicCustomPage({ params }: PageProps) {
  const config = await loadPage(params.slug);

  // Missing, draft and archived pages all 404 (the API only serves published ones).
  if (!config) {
    notFound();
  }

  const { page, sections, legacySections } = config;

  // A page that opens with a hero or banner already has its headline there,
  // so the plain title block would only repeat it.
  const leadsWithBanner = sections[0]?.type === "hero" || sections[0]?.type === "banner";

  return (
    <div className="min-h-screen bg-base-100 text-base-content pb-20">
      {/* Top Banner Header if CTA present */}
      {page.buttonTitle && (
        <div className="bg-gradient-to-r from-primary via-indigo-600 to-purple-600 text-white text-center py-3 px-4 text-sm font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{page.title}</span>
          <a
            href={page.buttonLink || "/shop"}
            className="underline underline-offset-2 hover:opacity-90 ml-2 font-bold inline-flex items-center gap-1"
          >
            {page.buttonTitle} <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {!leadsWithBanner && (
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-6 text-center space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {page.title}
          </h1>
          {page.metaDescription && (
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {page.metaDescription}
            </p>
          )}
        </div>
      )}

      {/* Primary HTML Content Block */}
      {page.content && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div
            className="prose dark:prose-invert max-w-none text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
          />
        </div>
      )}

      {legacySections.length > 0 && <LegacyPageSections sections={legacySections} />}

      {sections.length > 0 && <HomepageRenderer config={config} />}
    </div>
  );
}
