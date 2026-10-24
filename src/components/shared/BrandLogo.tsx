"use client";

import React, { useEffect, useState } from "react";
import { useCMSStore } from "@/store/useCMSStore";

interface BrandLogoProps {
  /** Rendered when no logo URL is configured or the image fails to load. */
  children: React.ReactNode;
  alt?: string;
  className?: string;
}

/**
 * Renders the CMS-configured site logo (Admin → Base CMS → Site Logo).
 * Falls back to the provided children (the default wordmark) when no valid
 * image URL is configured or the image cannot be loaded.
 */
export default function BrandLogo({ children, alt = "Aarham Apparel", className = "" }: BrandLogoProps) {
  const logoUrl = useCMSStore((state) => state.brand?.logoUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [logoUrl]);

  const url = (logoUrl || "").trim();
  if (!url || failed) return <>{children}</>;

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
