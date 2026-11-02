import Link from "next/link";
import type { SectionRenderProps } from "../types";
import SectionFrame, { alignmentClass, resolveColor } from "../SectionFrame";
import { CtaButtons } from "../primitives";
import DynamicIcon from "../DynamicIcon";

function CtaIcon({ value, className }: { value?: string; className: string }) {
  if (value === "none") return null;
  return (
    <span className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${className}`}>
      <DynamicIcon value={value} fallback="HeartHandshake" size={28} />
    </span>
  );
}

/** Variant: gradient-band — white buttons on the brand gradient. */
export function GradientCta({ section }: SectionRenderProps) {
  const settings = section.settings;
  const alignment = (settings.alignment as string) || "center";
  const secondaryText = settings.secondaryButtonText as string | undefined;

  return (
    <SectionFrame section={section}>
      <div
        className={`relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-indigo-800 to-slate-900 p-6 text-white shadow-xl sm:p-10 md:p-14 ${alignmentClass(alignment)}`}
        style={{ color: resolveColor(settings.textColor as string | undefined) }}
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <CtaIcon value={settings.icon as string | undefined} className="relative bg-white/15" />
        {section.title && (
          <h2 className="relative max-w-3xl text-2xl font-black leading-tight tracking-tight break-words sm:text-3xl md:text-4xl">
            {section.title}
          </h2>
        )}
        {section.description && (
          <p className="relative mt-3 max-w-2xl text-xs leading-relaxed opacity-85 whitespace-pre-line break-words sm:text-sm md:text-base">
            {section.description}
          </p>
        )}
        {(section.buttonText || secondaryText) && (
          <div
            className={`relative mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap ${
              alignment === "center" ? "sm:justify-center" : ""
            }`}
          >
            {section.buttonText && (
              <Link
                href={section.buttonLink || "/register"}
                className="btn w-full justify-center gap-2 rounded-full border-0 bg-white px-6 text-primary hover:bg-white/90 sm:w-auto sm:px-8"
              >
                <DynamicIcon value={settings.buttonIcon as string | undefined} fallback="ArrowRight" size={16} />
                <span className="break-words">{section.buttonText}</span>
              </Link>
            )}
            {secondaryText && (
              <Link
                href={(settings.secondaryButtonLink as string) || "/about"}
                className="btn btn-outline w-full justify-center gap-2 rounded-full border-white/60 px-6 text-white hover:border-white hover:bg-white/10 sm:w-auto sm:px-8"
              >
                <DynamicIcon value={settings.secondaryButtonIcon as string | undefined} size={16} />
                <span className="break-words">{secondaryText}</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </SectionFrame>
  );
}

/** Variant: centered-card */
export function CardCta({ section }: SectionRenderProps) {
  const alignment = (section.settings.alignment as string) || "center";

  return (
    <SectionFrame section={section}>
      <div
        className={`flex flex-col rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm sm:p-10 ${alignmentClass(alignment)}`}
      >
        <CtaIcon
          value={section.settings.icon as string | undefined}
          className="bg-primary/10 text-primary"
        />
        {section.title && (
          <h2 className="max-w-3xl text-2xl font-black leading-tight tracking-tight break-words sm:text-3xl">
            {section.title}
          </h2>
        )}
        {section.description && (
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-base-content/70 whitespace-pre-line break-words sm:text-sm md:text-base">
            {section.description}
          </p>
        )}
        <CtaButtons
          section={section}
          className={`mt-6 w-full sm:w-auto ${alignment === "center" ? "sm:justify-center" : ""}`}
        />
      </div>
    </SectionFrame>
  );
}
