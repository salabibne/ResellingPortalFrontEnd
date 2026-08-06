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

export async function generateMetadata({ params }: PageProps) {
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
      <div className="max-w-6xl mx-auto px-4 space-y-16 mt-8">
        {sortedSections.map((sec, idx) => {
          const isHero = sec.title?.toLowerCase().includes("hero") || idx === 0;
          const isBanner = sec.imageUrl && !isHero;

          return (
            <section
              key={sec.id || idx}
              className={`rounded-2xl p-6 sm:p-10 border transition ${
                isHero
                  ? "bg-gradient-to-br from-gray-900 to-indigo-950 text-white border-indigo-900/50 shadow-xl"
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
                  <h2 className={`text-2xl sm:text-4xl font-bold ${isHero ? "text-white" : "text-gray-900 dark:text-white"}`}>
                    {sec.title}
                  </h2>
                  {sec.description && (
                    <p className={`text-sm sm:text-base leading-relaxed ${isHero ? "text-gray-300" : "text-gray-600 dark:text-gray-300"}`}>
                      {sec.description}
                    </p>
                  )}

                  {sec.buttonText && (
                    <div className="pt-2">
                      <a
                        href={sec.buttonLink || "/shop"}
                        className={`btn ${
                          isHero ? "btn-primary text-white" : "btn-outline border-primary text-primary hover:bg-primary hover:text-white"
                        } inline-flex items-center gap-2`}
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
