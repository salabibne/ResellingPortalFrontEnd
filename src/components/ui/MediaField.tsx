"use client";

import { useRef, useState } from "react";
import { AlertTriangle, ImageIcon, Link2, Loader2, Trash2, Upload } from "lucide-react";
import mediaApi, { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_MB, uploadErrorMessage } from "@/services/media.api";
import { resolveImageUrl } from "@/components/homepage/SafeImage";
import { ImageSizeKey, describeImageSize } from "@/utils/imageSizes";

interface MediaFieldProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  /** Where the image is shown — drives the recommended size hint and auto-resize. */
  size?: ImageSizeKey;
  helpText?: string;
  required?: boolean;
}

/**
 * Image picker: upload a file from the computer/phone (primary), or paste a
 * link (secondary). Shows the recommended size for the placement.
 */
export default function MediaField({ label, value, onChange, size, helpText, required }: MediaFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [showLink, setShowLink] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setWarning(null);
    try {
      const { media, warning: fitWarning } = await mediaApi.uploadImage(file, size);
      onChange(media.url);
      setWarning(fitWarning);
    } catch (err: any) {
      setError(uploadErrorMessage(err));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const isWide = size ? ["logo", "wideBanner", "heroBanner", "storyImage", "productLandingBanner", "coverImage", "blogImage"].includes(size) : false;

  return (
    <div className="form-control">
      <label className="label py-1">
        <span className="label-text text-xs font-bold text-base-content">
          {label}
          {required && <span className="text-error"> *</span>}
        </span>
      </label>

      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          title="Click to upload"
          className={`${isWide ? "h-16 w-28" : "h-16 w-16"} shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-base-300 bg-base-200 hover:border-primary transition-colors`}
        >
          {uploading ? (
            <div className="flex h-full w-full items-center justify-center text-primary">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolveImageUrl(value)} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-base-content/30">
              <ImageIcon size={20} />
            </div>
          )}
        </button>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="btn btn-xs btn-primary text-white gap-1"
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {uploading ? "Uploading..." : value ? "Change image" : "Upload image"}
            </button>
            <button
              type="button"
              onClick={() => setShowLink((v) => !v)}
              className="btn btn-xs btn-ghost gap-1"
            >
              <Link2 size={12} /> {showLink ? "Hide link" : "Use link"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setWarning(null);
                }}
                className="btn btn-xs btn-ghost text-error gap-1"
              >
                <Trash2 size={12} /> Remove
              </button>
            )}
          </div>

          {showLink && (
            <input
              type="text"
              value={value || ""}
              onChange={(event) => onChange(event.target.value)}
              placeholder="https://… (paste an image link)"
              className="input input-bordered input-sm w-full font-mono text-[11px]"
            />
          )}

          <p className="text-[10px] text-base-content/60">
            {size ? `${describeImageSize(size)} · ` : ""}JPG, PNG, WebP or GIF · max {MAX_UPLOAD_MB} MB
          </p>
          {helpText && <p className="text-[10px] text-base-content/50">{helpText}</p>}
          {warning && (
            <p className="text-[10px] font-semibold text-warning flex items-start gap-1">
              <AlertTriangle size={11} className="mt-px shrink-0" /> {warning}
            </p>
          )}
          {error && <p className="text-[10px] font-semibold text-error">{error}</p>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </div>
  );
}
