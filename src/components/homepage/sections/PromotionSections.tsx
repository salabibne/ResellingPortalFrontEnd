import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { PromoCard, SectionRenderProps } from "../types";
import SectionFrame, { resolveColor } from "../SectionFrame";
import SafeImage from "../SafeImage";
import { CtaButtons, EmptySection, SectionHeading } from "../primitives";
import { gridClass } from "../layout";

function PromoImageCard({ card }: { card: PromoCard }) {
  const body = (
    <>
      <div className="absolute inset-0 bg-base-200">
        <SafeImage
          src={card.imageUrl}
          alt={card.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
      </div>
      <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-6 text-white">
        {card.eyebrow && (
          <span className="mb-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur">
            <Sparkles size={9} /> {card.eyebrow}
          </span>
        )}
        <h3 className="text-base sm:text-xl font-extrabold leading-tight break-words">
          {card.title}
        </h3>
        {card.description && (
          <p className="mt-1 text-[11px] sm:text-sm opacity-85 line-clamp-2">
            {card.description}
          </p>
        )}
        {card.buttonText && (
          <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-900">
            {card.buttonText} <ArrowRight size={11} />
          </span>
        )}
      </div>
    </>
  );

  if (card.buttonLink) {
    return (
      <Link
        href={card.buttonLink}
        className="group relative block min-h-[200px] sm:min-h-[240px] overflow-hidden rounded-2xl"
      >
        {body}
      </Link>
    );
  }

  return (
    <div className="group relative min-h-[200px] sm:min-h-[240px] overflow-hidden rounded-2xl">
      {body}
    </div>
  );
}

/** Variants: two-cards | three-columns */
export function PromotionCards({ section, mode = "view" }: SectionRenderProps) {
  const cards = (section.settings.cards as unknown as PromoCard[]) || [];
  const columns = Math.min(Math.max(Number(section.settings.columns ?? 2), 1), 3);

  if (cards.length === 0) {
    if (mode !== "edit") return null;
    return (
      <SectionFrame section={section}>
        <EmptySection message="Add at least one offer card in the editor." />
      </SectionFrame>
    );
  }

  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} className="mb-6 sm:mb-8" />
      <div className={`grid gap-3 sm:gap-5 ${gridClass(columns)}`}>
        {cards.map((card, index) => (
          <PromoImageCard key={index} card={card} />
        ))}
      </div>
    </SectionFrame>
  );
}

/** Variants: full-width-banner | image-overlay */
export function PromotionBanner({ section, mode = "view" }: SectionRenderProps) {
  const overlay = Number(section.settings.overlayOpacity ?? 45) / 100;
  const textColor = resolveColor(section.settings.textColor) || "#ffffff";
  const hasContent = Boolean(section.title || section.imageUrl || section.description);
  const imageOverlay = section.variant === "image-overlay" && Boolean(section.imageUrl);

  if (!hasContent) {
    if (mode !== "edit") return null;
    return (
      <SectionFrame section={section}>
        <EmptySection message="Add a title or image for this promotion." />
      </SectionFrame>
    );
  }

  return (
    <SectionFrame section={section}>
      <div
        className={`relative overflow-hidden rounded-3xl min-h-[220px] sm:min-h-[300px] flex items-center ${
          imageOverlay
            ? "bg-slate-900"
            : "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900"
        }`}
      >
        <div className="absolute inset-0">
          <SafeImage
            src={section.imageUrl}
            alt={imageOverlay ? section.imageDescription || section.title : ""}
            className={`h-full w-full object-cover ${
              imageOverlay ? "" : "opacity-20 mix-blend-overlay"
            }`}
          />
          {imageOverlay && (
            <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />
          )}
        </div>

        <div className="relative z-10 w-full max-w-2xl p-6 sm:p-10" style={{ color: textColor }}>
          {section.subtitle && (
            <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles size={10} /> {section.subtitle}
            </span>
          )}
          {section.title && (
            <h2 className="text-2xl sm:text-4xl font-black leading-tight break-words">
              {section.title}
            </h2>
          )}
          {section.description && (
            <p className="mt-2 text-xs sm:text-sm leading-relaxed opacity-90 whitespace-pre-line">
              {section.description}
            </p>
          )}
          <CtaButtons section={section} className="mt-5" />
        </div>
      </div>
    </SectionFrame>
  );
}

/** Variant: text-only — offer cards with no images. */
export function TextOnlyPromotion({ section, mode = "view" }: SectionRenderProps) {
  const cards = (section.settings.cards as unknown as PromoCard[]) || [];
  const columns = Math.min(Math.max(Number(section.settings.columns ?? 2), 1), 3);

  if (cards.length === 0) {
    const hasMainContent = Boolean(section.title || section.description);

    if (!hasMainContent) {
      if (mode !== "edit") return null;
      return (
        <SectionFrame section={section}>
          <EmptySection message="Add offer cards or a title in the editor." />
        </SectionFrame>
      );
    }

    return (
      <SectionFrame section={section}>
        <div className="rounded-3xl border border-primary/15 bg-base-200/60 p-6 sm:p-10">
          <SectionHeading section={section} />
          <CtaButtons section={section} className="mt-5" />
        </div>
      </SectionFrame>
    );
  }

  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} className="mb-6 sm:mb-8" />
      <div className={`grid gap-3 sm:gap-5 ${gridClass(columns)}`}>
        {cards.map((card, index) => (
          <div
            key={index}
            className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm"
          >
            <div>
              {card.eyebrow && (
                <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                  <Sparkles size={9} /> {card.eyebrow}
                </span>
              )}
              <h3 className="text-base sm:text-lg font-extrabold break-words">
                {card.title}
              </h3>
              {card.description && (
                <p className="mt-1.5 text-[11px] sm:text-sm leading-relaxed text-base-content/65 break-words">
                  {card.description}
                </p>
              )}
            </div>
            {card.buttonText &&
              (card.buttonLink ? (
                <Link
                  href={card.buttonLink}
                  className="inline-flex w-fit items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                >
                  {card.buttonText} <ArrowRight size={11} />
                </Link>
              ) : (
                <span className="text-[11px] font-bold text-primary">{card.buttonText}</span>
              ))}
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}
