import React from "react";
import { notFound } from "next/navigation";
import customPagesApi, { CustomPage } from "@/services/customPages.api";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { ArrowRight, CheckCircle2, Sparkles, Star } from "lucide-react";

interface PageProps {
  params: {
    slug: string;
  };
}

function getYouTubeEmbedUrl(url: string): string {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return "";
}

export async function generateMetadata({ params }: PageProps) {
  // The home page is served by "/" from the Homepage Customizer, never here.
  if (params.slug === "home") {
    return { title: "Page Not Found - Aarham Apparel" };
  }

  try {
    const page = await customPagesApi.getBySlug(params.slug);
    if (!page || page.status !== "PUBLISHED") {
      return { title: "Page Not Found - Aarham Apparel" };
    }
    return {
      title: page.metaTitle || `${page.title} - Aarham Apparel`,
      description: page.metaDescription || page.title,
    };
  } catch (err) {
    return { title: "Custom Page - Aarham Apparel" };
  }
}

export default async function PublicCustomPage({ params }: PageProps) {
  // The home page is served by "/" from the Homepage Customizer, never here.
  if (params.slug === "home") {
    notFound();
  }

  let page: CustomPage | null = null;

  try {
    page = await customPagesApi.getBySlug(params.slug);
  } catch (err) {
    page = null;
  }

  // Draft protection & 404 handler
  if (!page || page.status !== "PUBLISHED") {
    notFound();
  }

  const sortedSections = (page.sections || []).sort((a, b) => a.sortOrder - b.sortOrder);

  // Group consecutive card-style sections so features/team/blogs render as grids.
  const blocks: { kind: string; items: typeof sortedSections }[] = [];
  sortedSections.forEach((sec) => {
    const type = String(((sec.content as any) || {}).type || "").toLowerCase();
    const isGrouped =
      type === "feature_card" || type === "team_member" || type === "founder_blog";
    const last = blocks[blocks.length - 1];
    if (isGrouped && last && last.kind === type) {
      last.items.push(sec);
    } else {
      blocks.push({ kind: type, items: [sec] });
    }
  });

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

      {/* Main Page Title */}
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

      {/* Primary HTML Content Block */}
      {page.content && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div
            className="prose dark:prose-invert max-w-none text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
          />
        </div>
      )}

      {/* Dynamic Section Engine */}
      <div className="max-w-6xl mx-auto px-4 space-y-8 mt-8">
        {blocks.map((block, blockIdx) => {
          const { kind, items } = block;
          const contentOf = (sec: any) => (sec.content as any) || {};

          // Feature cards, team members and founder blogs: responsive card grids
          if (kind === "feature_card" || kind === "team_member" || kind === "founder_blog") {
            return (
              <div
                key={`block-${blockIdx}`}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {items.map((sec, idx) => {
                  const content = contentOf(sec);
                  const cardKey = sec.id || `${blockIdx}-${idx}`;

                  if (kind === "team_member") {
                    return (
                      <div
                        key={cardKey}
                        className="rounded-2xl p-6 border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm text-center"
                      >
                        {sec.imageUrl ? (
                          <img
                            src={sec.imageUrl}
                            alt={sec.title || "Team member"}
                            className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-primary/20"
                          />
                        ) : (
                          <div className="w-28 h-28 rounded-full bg-primary/10 mx-auto" />
                        )}
                        <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                          {sec.title}
                        </h3>
                        {sec.subtitle && (
                          <p className="text-xs uppercase tracking-wider text-primary font-semibold mt-1">
                            {sec.subtitle}
                          </p>
                        )}
                        {sec.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 whitespace-pre-line">
                            {sec.description}
                          </p>
                        )}
                      </div>
                    );
                  }

                  if (kind === "founder_blog") {
                    return (
                      <div
                        key={cardKey}
                        className="rounded-2xl overflow-hidden border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm flex flex-col"
                      >
                        {sec.imageUrl && (
                          <img
                            src={sec.imageUrl}
                            alt={sec.title || "Blog cover"}
                            className="h-44 w-full object-cover"
                          />
                        )}
                        <div className="p-5 flex-1 flex flex-col">
                          <span className="badge badge-ghost badge-sm self-start mb-2">
                            {sec.subtitle || "Blog"}
                          </span>
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            {sec.title}
                          </h3>
                          {sec.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-line flex-1">
                              {sec.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={cardKey}
                      className="rounded-2xl p-6 border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm flex flex-col"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Sparkles size={18} />
                        </span>
                        {content.cardIcon && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {content.cardIcon}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {sec.title}
                      </h3>
                      {sec.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed whitespace-pre-line flex-1">
                          {sec.description}
                        </p>
                      )}
                      {sec.imageUrl && (
                        <img
                          src={sec.imageUrl}
                          alt={sec.title || "Feature"}
                          className="mt-4 rounded-xl object-cover max-h-56 w-full"
                        />
                      )}
                      {sec.buttonText && (
                        <a
                          href={sec.buttonLink || "#"}
                          className="btn btn-sm btn-outline btn-primary mt-4 self-start inline-flex items-center gap-1"
                        >
                          {sec.buttonText} <ArrowRight size={14} />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          }

          {/* Founder profile: photo + quote */}
          if (kind === "founder_profile") {
            const sec = items[0];
            return (
              <section
                key={`block-${blockIdx}`}
                className="rounded-2xl p-6 sm:p-10 border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                {sec.imageUrl && (
                  <div className="flex justify-center">
                    <img
                      src={sec.imageUrl}
                      alt={sec.title || "Founder"}
                      className="rounded-2xl object-cover max-h-[420px] w-full shadow-lg"
                    />
                  </div>
                )}
                <div className="space-y-4">
                  {sec.subtitle && (
                    <span className="inline-block px-3 py-1 bg-primary/20 text-primary font-semibold text-xs rounded-full uppercase tracking-wider">
                      {sec.subtitle}
                    </span>
                  )}
                  <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    {sec.title}
                  </h2>
                  {sec.description && (
                    <p className="text-base italic leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      &ldquo;{sec.description}&rdquo;
                    </p>
                  )}
                </div>
              </section>
            );
          }

          {/* Founder videos: title + embed + summary */}
          if (kind === "founder_video") {
            const sec = items[0];
            const embedUrl = getYouTubeEmbedUrl(contentOf(sec).videoLink || "");
            return (
              <section
                key={`block-${blockIdx}`}
                className="rounded-2xl p-6 sm:p-10 border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm space-y-4"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{sec.title}</h3>
                {embedUrl && (
                  <div className="w-full rounded-xl overflow-hidden bg-black aspect-video">
                    <iframe
                      src={embedUrl}
                      title={sec.title || "Founder video"}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                {sec.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                    {sec.description}
                  </p>
                )}
              </section>
            );
          }

          {/* Default: generic title / description / image / button block */}
          const sec = items[0];
          const isHero = sec.title?.toLowerCase().includes("hero");
          const isBanner = sec.imageUrl && !isHero;

          return (
            <section
              key={`block-${blockIdx}`}
              className={`rounded-2xl p-6 sm:p-10 border transition ${
                isHero
                  ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl"
                  : isBanner
                  ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm"
                  : "bg-base-200/50 border-base-300 dark:bg-gray-800/40 dark:border-gray-700"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  {sec.subtitle && (
                    <span className="inline-block px-3 py-1 bg-primary/20 text-primary font-semibold text-xs rounded-full uppercase tracking-wider">
                      {sec.subtitle}
                    </span>
                  )}
                  <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    {sec.title}
                  </h2>
                  {sec.description && (
                    <p className="text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-300">
                      {sec.description}
                    </p>
                  )}

                  {sec.buttonText && (
                    <div className="pt-2">
                      <a
                        href={sec.buttonLink || "/shop"}
                        className="btn bg-blue-600 hover:bg-blue-700 text-white border-none shadow-md inline-flex items-center gap-2"
                      >
                        {sec.buttonText} <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>

                {sec.imageUrl && (
                  <div className="flex justify-center">
                    <img
                      src={sec.imageUrl}
                      alt={sec.title}
                      className="rounded-xl object-cover max-h-96 w-full shadow-lg border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
