"use client";

import React, { useState } from "react";
import { Bold, Italic, Heading1, Heading2, Heading3, List, Link as LinkIcon, Code, Eye, FileText, Quote } from "lucide-react";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write content here...",
  minHeight = "250px",
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "code" | "preview">("write");

  const insertFormatting = (tagStart: string, tagEnd: string = "") => {
    if (!tagEnd) {
      onChange(`${value}\n${tagStart}`);
      return;
    }
    onChange(`${value}${tagStart}Text${tagEnd}`);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white text-black">
      {/* Editor Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-200 bg-gray-50 p-2 gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertFormatting("<strong>", "</strong>")}
            className="p-1.5 rounded hover:bg-gray-200 text-black transition"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("<em>", "</em>")}
            className="p-1.5 rounded hover:bg-gray-200 text-black transition"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <span className="w-px h-5 bg-gray-300 mx-1" />
          <button
            type="button"
            onClick={() => insertFormatting("<h1>", "</h1>")}
            className="p-1.5 rounded hover:bg-gray-200 text-black transition"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("<h2>", "</h2>")}
            className="p-1.5 rounded hover:bg-gray-200 text-black transition"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("<h3>", "</h3>")}
            className="p-1.5 rounded hover:bg-gray-200 text-black transition"
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <span className="w-px h-5 bg-gray-300 mx-1" />
          <button
            type="button"
            onClick={() => insertFormatting("<p>", "</p>")}
            className="p-1.5 rounded hover:bg-gray-200 text-black transition"
            title="Paragraph"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("<ul>\n  <li>", "</li>\n</ul>")}
            className="p-1.5 rounded hover:bg-gray-200 text-black transition"
            title="List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('<blockquote>"', '"</blockquote>')}
            className="p-1.5 rounded hover:bg-gray-200 text-black transition"
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('<a href="https://">', "</a>")}
            className="p-1.5 rounded hover:bg-gray-200 text-black transition"
            title="Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-gray-200 p-1 rounded-md text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`px-2.5 py-1 rounded transition font-medium flex items-center gap-1 ${
              activeTab === "write"
                ? "bg-white shadow-xs text-primary"
                : "text-gray-700 hover:text-black"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Text
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`px-2.5 py-1 rounded transition font-medium flex items-center gap-1 ${
              activeTab === "code"
                ? "bg-white shadow-xs text-primary"
                : "text-gray-700 hover:text-black"
            }`}
          >
            <Code className="w-3.5 h-3.5" /> HTML
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-2.5 py-1 rounded transition font-medium flex items-center gap-1 ${
              activeTab === "preview"
                ? "bg-white shadow-xs text-primary"
                : "text-gray-700 hover:text-black"
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="p-3 bg-white text-black" style={{ minHeight }}>
        {activeTab === "write" && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full min-h-[220px] bg-white resize-y outline-none font-sans text-sm text-black"
          />
        )}

        {activeTab === "code" && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="<p>Enter HTML string...</p>"
            className="w-full h-full min-h-[220px] bg-gray-900 text-emerald-400 p-3 font-mono text-xs rounded-md resize-y outline-none"
          />
        )}

        {activeTab === "preview" && (
          <div
            className="prose max-w-none text-sm text-black leading-relaxed min-h-[220px]"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(value || "<p className='text-gray-400 italic'>Nothing to preview</p>") }}
          />
        )}
      </div>
    </div>
  );
}
