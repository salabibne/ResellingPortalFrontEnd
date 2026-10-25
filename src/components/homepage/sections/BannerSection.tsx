import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { SectionRenderProps } from "../types";
import SectionFrame, { resolveColor } from "../SectionFrame";
import SafeImage from "../SafeImage";
import { CtaButtons, Eyebrow } from "../primitives";

/** Variants: default | image-overlay */
export function BannerSection({ section }: SectionRenderProps) {
  const hasImage = Boolean(section.imageUrl);
  const overlay = Number(section.settings.overlayOpacity ?? 40) / 100;
  const textColor = resolveColor(section.settings.textColor) || "#ffffff";
  const alignment = (section.settings.alignment as string) || "center";
  // The two variants must look genuinely different: one is a gradient banner
  // with the image as a subtle texture, the other is a full image overlay.
  const imageOverlay = section.variant === "image-overlay" && hasImage;

  const alignmentClass =
    alignment === "left"
      ? "items-start text-left"
      : alignment === "right"
      ? "items-end text-right"
      : "items-center text-center";

  return (
    <SectionFrame section={section}>
      <div
        className={`relative overflow-hidden rounded-3xl text-white shadow-xl border border-white/10 p-6 sm:p-10 md:p-14 ${
          imageOverlay
            ? "bg-slate-900"
            : "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900"
        }`}
      >
        {hasImage &&
          (imageOverlay ? (
            <>
              <SafeImage
                src={section.imageUrl}
                alt={section.imageDescription || section.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />
            </>
          ) : (
            <SafeImage
              src={section.imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
            />
          ))}

        <div className={`relative z-10 flex flex-col ${alignmentClass}`} style={{ color: textColor }}>
          <div className="max-w-2xl w-full">
            {section.subtitle && (
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                <Sparkles size={12} />
                <span>{section.subtitle}</span>
              </div>
            )}
            {section.title && (
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight break-words">
                {section.title}
              </h2>
            )}
            {section.description && (
              <p className="mt-3 text-xs sm:text-sm md:text-base leading-relaxed opacity-85 whitespace-pre-line">
                {section.description}
              </p>
            )}
            <CtaButtons section={section} className={`mt-5 ${alignment === "center" ? "justify-center" : ""}`} />
            {!section.buttonText && section.buttonLink && (
              <Link
                href={section.buttonLink}
                className="btn btn-primary mt-4 gap-2 rounded-2xl font-bold"
              >
                Shop now <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}

/** Variant: text-only — typography banner with no image at all. */
export function TextOnlyBanner({ section, mode = "view" }: SectionRenderProps) {
  const alignment = (section.settings.alignment as string) || "center";
  const hasContent = Boolean(section.title || section.description);

  if (!hasContent && mode !== "edit") return null;

  return (
    <SectionFrame section={section}>
      <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-base-200/60 p-6 sm:p-10 md:p-14">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          className={`relative z-10 flex flex-col ${
            alignment === "left"
              ? "items-start text-left"
              : alignment === "right"
              ? "items-end text-right"
              : "items-center text-center"
          }`}
        >
          <Eyebrow text={section.subtitle} />
          {section.title && (
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight break-words">
              {section.title}
            </h2>
          )}
          <div className="mt-4 h-1 w-14 rounded-full bg-primary" aria-hidden="true" />
          {section.description && (
            <p className="mt-3 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-base-content/70 whitespace-pre-line break-words">
              {section.description}
            </p>
          )}
          <CtaButtons
            section={section}
            className={`mt-5 ${alignment === "center" ? "justify-center" : ""}`}
          />
        </div>
      </div>
    </SectionFrame>
  );
}
