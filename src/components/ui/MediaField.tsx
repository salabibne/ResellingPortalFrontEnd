"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import mediaApi from "@/services/media.api";
import { resolveImageUrl } from "@/components/homepage/SafeImage";

interface MediaFieldProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  helpText?: string;
}

export default function MediaField({ label, value, onChange, helpText }: MediaFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await mediaApi.upload(file);
      onChange(uploaded.url);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="form-control">
      <label className="label py-1">
        <span className="label-text text-xs font-bold text-base-content">{label}</span>
      </label>

      <div className="flex items-start gap-2">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-base-300 bg-base-200">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveImageUrl(value)}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-base-content/30">
              <ImageIcon size={20} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <input
            type="text"
            value={value || ""}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://… or /uploads/…"
            className="input input-bordered input-sm w-full font-mono text-[11px]"
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="btn btn-xs btn-outline gap-1"
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {uploading ? "Uploading" : "Upload"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="btn btn-xs btn-ghost text-error gap-1"
              >
                <Trash2 size={12} /> Remove
              </button>
            )}
          </div>
          {helpText && <p className="text-[10px] text-base-content/50">{helpText}</p>}
          {error && <p className="text-[10px] font-semibold text-error">{error}</p>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </div>
  );
}
