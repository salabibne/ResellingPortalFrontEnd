import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SectionRenderProps } from "../types";
import SectionFrame, { alignmentClass, resolveColor } from "../SectionFrame";
import SafeImage from "../SafeImage";
import { CtaButtons, SectionHeading } from "../primitives";

function HeroImage({
  section,
  priority,
  className = "",
}: {
  section: SectionRenderProps["section"];
  priority: boolean;
  className?: string;
}) {
  const mobileImage = section.settings.mobileImageUrl as string | undefined;
  const focal = section.settings.focalPoint as string | undefined;
  const objectPosition =
    focal === "top" ? "center top" : focal === "bottom" ? "center bottom" : undefined;

  return (
    <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-base-200 ${className}`}>
      {mobileImage ? (
        <>
          <SafeImage
            src={section.imageUrl}
            alt={section.imageDescription || section.title}
            priority={priority}
            objectPosition={objectPosition}
            className="hidden sm:block w-full h-full object-cover"
          />
          <SafeImage
            src={mobileImage}
            alt={section.imageDescription || section.title}
            priority={priority}
            objectPosition={objectPosition}
            className="block sm:hidden w-full h-full object-cover"
          />
        </>
      ) : (
        <SafeImage
          src={section.imageUrl}
          alt={section.imageDescription || section.title}
          priority={priority}
          objectPosition={objectPosition}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}

/** Variants: split-image-right | split-image-left */
export function SplitHero({ section, level = 1 }: SectionRenderProps) {
  const imageFirst = section.variant === "split-image-left";
  const mobileImageFirst = section.settings.mobileOrder === "image-first";
  const alignment = (section.settings.alignment as string) || "left";

  return (
    <SectionFrame section={section} className="border-b border-base-200">
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <div
          className={`flex-1 w-full ${alignmentClass(alignment)} ${
            mobileImageFirst ? "order-2" : "order-1"
          } ${imageFirst ? "lg:order-2" : "lg:order-1"}`}
        >
          <SectionHeading
            section={section}
            level={level}
            align={alignment as "left" | "center" | "right"}
          />
          <CtaButtons section={section} className="mt-6 sm:mt-8" />
        </div>
        <HeroImage
          section={section}
          priority={level === 1}
          className={`flex-1 w-full aspect-video sm:aspect-[4/3] max-h-[460px] ${
            mobileImageFirst ? "order-1" : "order-2"
          } ${imageFirst ? "lg:order-1" : "lg:order-2"}`}
        />
      </div>
    </SectionFrame>
  );
}

/** Variant: full-width-overlay */
export function FullWidthOverlayHero({ section, level = 1 }: SectionRenderProps) {
  const overlay = Number(section.settings.overlayOpacity ?? 45) / 100;
  const minHeight = Number(section.settings.minHeight ?? 440);
  const textColor = resolveColor(section.settings.textColor) || "#ffffff";

  return (
    <SectionFrame section={section} fullBleed className="relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0">
        <SafeImage
          src={section.imageUrl}
          alt={section.imageDescription || section.title}
          priority={level === 1}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />
      </div>
      <div
        className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 flex items-center"
        style={{ minHeight }}
      >
        <div className="max-w-2xl flex flex-col items-start" style={{ color: textColor }}>
          {section.subtitle && (
            <span className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
              {section.subtitle}
            </span>
          )}
          {section.title &&
            (level === 1 ? (
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                {section.title}
              </h1>
            ) : (
              <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
                {section.title}
              </h2>
            ))}
          {section.description && (
            <p className="mt-4 text-sm sm:text-base leading-relaxed opacity-90 max-w-xl">
              {section.description}
            </p>
          )}
          <CtaButtons section={section} className="mt-6 sm:mt-8" />
        </div>
      </div>
    </SectionFrame>
  );
}

/** Variant: centered-overlay */
export function CenteredOverlayHero({ section, level = 1 }: SectionRenderProps) {
  const overlay = Number(section.settings.overlayOpacity ?? 50) / 100;
  const minHeight = Number(section.settings.minHeight ?? 420);
  const textColor = resolveColor(section.settings.textColor) || "#ffffff";

  return (
    <SectionFrame section={section} fullBleed className="relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0">
        <SafeImage
          src={section.imageUrl}
          alt={section.imageDescription || section.title}
          priority={level === 1}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />
      </div>
      <div
        className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 text-center sm:px-6"
        style={{ minHeight, color: textColor, justifyContent: "center" }}
      >
        {section.subtitle && (
          <span className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
            {section.subtitle}
          </span>
        )}
        {section.title &&
          (level === 1 ? (
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              {section.title}
            </h1>
          ) : (
            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              {section.title}
            </h2>
          ))}
        {section.description && (
          <p className="mt-4 text-sm sm:text-base leading-relaxed opacity-90">
            {section.description}
          </p>
        )}
        <div className="mt-6 flex justify-center">
          <CtaButtons section={section} className="justify-center" />
        </div>
      </div>
    </SectionFrame>
  );
}

/** Variant: minimal-centered */
export function MinimalCenteredHero({ section, level = 1 }: SectionRenderProps) {
  return (
    <SectionFrame section={section}>
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <SectionHeading section={section} level={level} align="center" />
        <CtaButtons section={section} className="mt-6 justify-center" />
      </div>
      {section.imageUrl && (
        <div className="mt-8 sm:mt-10">
          <HeroImage
            section={section}
            priority={level === 1}
            className="aspect-[16/9] max-h-[520px]"
          />
        </div>
      )}
    </SectionFrame>
  );
}

/** Variant: promo-category */
export function PromoCategoryHero({ section, level = 1 }: SectionRenderProps) {
  return (
    <SectionFrame section={section}>
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="order-2 lg:order-1 flex flex-col justify-center">
          <SectionHeading
            section={section}
            level={level}
            align={(section.settings.alignment as "left" | "center" | "right") || "left"}
          />
          <CtaButtons section={section} className="mt-6" />
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={section.buttonLink || "/shop"}
              className="badge badge-lg badge-outline gap-1 font-semibold"
            >
              Shop the edit <ArrowRight size={12} />
            </Link>
          </div>
        </div>
        <HeroImage
          section={section}
          priority={level === 1}
          className="order-1 lg:order-2 aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5] max-h-[560px]"
        />
      </div>
    </SectionFrame>
  );
}
