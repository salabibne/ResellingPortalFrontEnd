import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { HomepageSection } from "./types";
import { alignmentClass } from "./SectionFrame";

export function Eyebrow({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2">
      <Sparkles size={12} />
      <span>{text}</span>
    </div>
  );
}

interface SectionHeadingProps {
  section: HomepageSection;
  level?: 1 | 2;
  align?: "left" | "center" | "right";
  className?: string;
  showDescription?: boolean;
}

export function SectionHeading({
  section,
  level = 2,
  align,
  className = "",
  showDescription = true,
}: SectionHeadingProps) {
  const Tag = level === 1 ? "h1" : "h2";
  const alignment = align || (section.settings.alignment as string) || "left";
  const sizeClass =
    level === 1
      ? "text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight"
      : "text-2xl sm:text-3xl md:text-4xl leading-tight";

  return (
    <div className={`flex flex-col ${alignmentClass(alignment)} ${className}`}>
      <Eyebrow text={section.subtitle} />
      {section.title && (
        <Tag className={`${sizeClass} font-extrabold tracking-tight break-words`}>
          {section.title}
        </Tag>
      )}
      {showDescription && section.description && (
        <p className="mt-3 text-sm sm:text-base text-base-content/70 leading-relaxed max-w-2xl whitespace-pre-line break-words">
          {section.description}
        </p>
      )}
    </div>
  );
}

const BUTTON_STYLES: Record<string, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
  ghost: "btn-ghost",
};

interface CtaButtonsProps {
  section: HomepageSection;
  className?: string;
}

export function CtaButtons({ section, className = "" }: CtaButtonsProps) {
  const secondaryText = section.settings.secondaryButtonText as string | undefined;
  const secondaryLink = section.settings.secondaryButtonLink as string | undefined;
  const secondaryStyle =
    BUTTON_STYLES[(section.settings.secondaryButtonStyle as string) || "outline"] ||
    "btn-outline";

  if (!section.buttonText && !secondaryText) return null;

  return (
    <div className={`flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 ${className}`}>
      {section.buttonText && (
        <Link
          href={section.buttonLink || "/shop"}
          className="btn btn-primary rounded-full px-6 sm:px-8 w-full sm:w-auto justify-center gap-2"
        >
          <span className="break-words">{section.buttonText}</span>
          <ArrowRight size={16} />
        </Link>
      )}
      {secondaryText && (
        <Link
          href={secondaryLink || "/about"}
          className={`btn ${secondaryStyle} rounded-full px-6 sm:px-8 w-full sm:w-auto justify-center`}
        >
          <span className="break-words">{secondaryText}</span>
        </Link>
      )}
    </div>
  );
}

export function EmptySection({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/40 p-8 sm:p-12 text-center">
      <p className="text-sm font-semibold text-base-content/60">{message}</p>
    </div>
  );
}
