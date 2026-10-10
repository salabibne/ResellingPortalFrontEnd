"use client";

import React, { useEffect, useState } from "react";
import { X, FileText, ShieldCheck, Clock } from "lucide-react";
import legalDocumentsApi, { LegalDocument } from "@/services/legalDocuments.api";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

interface CheckoutLegalModalProps {
  slug: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutLegalModal({ slug, isOpen, onClose }: CheckoutLegalModalProps) {
  const [doc, setDoc] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && slug) {
      setLoading(true);
      legalDocumentsApi
        .getBySlug(slug)
        .then((data) => setDoc(data))
        .catch(() => setDoc(null))
        .finally(() => setLoading(false));
    }
  }, [isOpen, slug]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end p-0 sm:p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto border border-gray-200 dark:border-gray-700">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              {doc?.title || "Legal Terms & Policy"}
            </h3>
            {doc?.version && (
              <span className="badge badge-outline text-[11px] font-mono">v{doc.version}</span>
            )}
          </div>
          <button onClick={onClose} className="btn btn-sm btn-ghost btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 overflow-y-auto flex-1 text-sm">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading agreement content...</div>
          ) : !doc ? (
            <div className="p-8 text-center text-gray-500">Document unavailable.</div>
          ) : (
            <div
              className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(doc.content) }}
            />
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
          <button onClick={onClose} className="btn btn-primary text-white text-xs px-6">
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
