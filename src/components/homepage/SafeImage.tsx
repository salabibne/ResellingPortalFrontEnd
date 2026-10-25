import { ImageIcon } from "lucide-react";

interface SafeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  objectPosition?: string;
}

/**
 * Plain <img> with a reserved box and a graceful placeholder. The app has no
 * next/image remote-pattern configuration, so remote URLs stay plain images.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/** Uploaded media lives on the API origin, not the Next.js origin. */
export function resolveImageUrl(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (src.startsWith("/uploads/")) return `${API_BASE_URL}${src}`;
  return src;
}

export default function SafeImage({
  src,
  alt,
  className = "",
  priority = false,
  objectPosition,
}: SafeImageProps) {
  const resolvedSrc = resolveImageUrl(src);

  if (!resolvedSrc) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-base-200 via-base-200 to-base-300 text-base-content/25 ${className}`}
        aria-hidden="true"
      >
        <ImageIcon size={32} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolvedSrc}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={objectPosition ? { objectPosition } : undefined}
      className={className}
    />
  );
}
