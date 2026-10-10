import React from "react";
import { notFound } from "next/navigation";
import legalDocumentsApi, { LegalDocument } from "@/services/legalDocuments.api";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { ShieldCheck, Clock, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/shared/Footer";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const doc = await legalDocumentsApi.getBySlug(params.slug);
    if (!doc || doc.status !== "PUBLISHED") {
      return { title: "Document Not Found - Aarham Apparel" };
    }
    return {
      title: `${doc.title} | Aarham Apparel`,
      description: `${doc.title} version ${doc.version} for Aarham Apparel reselling portal.`,
    };
  } catch (err) {
    return { title: "Legal Policy - Aarham Apparel" };
  }
}

export default async function PublicLegalDocumentPage({ params }: PageProps) {
  let doc: LegalDocument | null = null;

  try {
    doc = await legalDocumentsApi.getBySlug(params.slug);
  } catch (err) {
    doc = null;
  }

  if (!doc || doc.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-100 text-base-content">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Single Unified Document Container matching site design */}
        <article className="bg-base-100 border border-base-300 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
          {/* Header Metadata */}
          <div className="border-b border-base-200 pb-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="badge badge-primary gap-1.5 font-semibold py-2 px-3">
                <ShieldCheck className="w-3.5 h-3.5" /> Official Policy
              </span>
              <div className="flex items-center gap-3 text-base-content/70">
                <span className="badge badge-outline font-mono">
                  Version {doc.version}
                </span>
                {doc.updatedAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Updated {new Date(doc.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-base-content">
              {doc.title}
            </h1>
          </div>

          {/* Clean Document Body */}
          <div
            className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-base-content/90"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(doc.content) }}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
}
