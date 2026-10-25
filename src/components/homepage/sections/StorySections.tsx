import type { SectionRenderProps } from "../types";
import SectionFrame, { resolveColor } from "../SectionFrame";
import SafeImage from "../SafeImage";
import { CtaButtons, SectionHeading } from "../primitives";

function StoryImage({ section, className = "" }: { section: SectionRenderProps["section"]; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl sm:rounded-3xl bg-base-200 ${className}`}>
      <SafeImage
        src={section.imageUrl}
        alt={section.imageDescription || section.title}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

/** Variants: image-left | image-right */
export function SplitStory({ section }: SectionRenderProps) {
  const imageRight = section.variant === "image-right";
  const mobileImageFirst = section.settings.mobileOrder === "image-first";

  return (
    <SectionFrame section={section}>
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <div
          className={`flex-1 w-full ${mobileImageFirst ? "order-2" : "order-1"} ${
            imageRight ? "lg:order-1" : "lg:order-2"
          }`}
        >
          <SectionHeading section={section} level={2} />
          <CtaButtons section={section} className="mt-6" />
        </div>
        <StoryImage
          section={section}
          className={`flex-1 w-full aspect-[4/3] max-h-[440px] ${
            mobileImageFirst ? "order-1" : "order-2"
          } ${imageRight ? "lg:order-2" : "lg:order-1"}`}
        />
      </div>
    </SectionFrame>
  );
}

/** Variant: full-width-bg */
export function BackgroundStory({ section }: SectionRenderProps) {
  const overlay = Number(section.settings.overlayOpacity ?? 55) / 100;
  const textColor = resolveColor(section.settings.textColor) || "#ffffff";

  return (
    <SectionFrame section={section} fullBleed className="relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0">
        <SafeImage
          src={section.imageUrl}
          alt={section.imageDescription || section.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />
      </div>
      <div className="relative mx-auto max-w-3xl px-4 py-16 sm:py-24 text-center" style={{ color: textColor }}>
        {section.subtitle && (
          <span className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
            {section.subtitle}
          </span>
        )}
        {section.title && (
          <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">{section.title}</h2>
        )}
        {section.description && (
          <p className="mt-4 text-sm sm:text-base leading-relaxed opacity-90 whitespace-pre-line">
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

/** Variant: centered */
export function CenteredStory({ section }: SectionRenderProps) {
  return (
    <SectionFrame section={section}>
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <SectionHeading section={section} level={2} align="center" />
        <CtaButtons section={section} className="mt-6 justify-center" />
      </div>
      {section.imageUrl && (
        <StoryImage section={section} className="mt-8 aspect-[16/9] max-h-[520px]" />
      )}
    </SectionFrame>
  );
}
