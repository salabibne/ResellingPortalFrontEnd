"use client";

import type { HomepageConfig, HomepageSectionType, SectionRenderProps } from "./types";
import { getSectionDefinition, resolveSectionComponent } from "./registry";
import ScrollReveal, { type RevealVariant } from "@/components/public/ScrollReveal";

const KNOWN_ANIMATIONS: RevealVariant[] = [
  "fade-up",
  "slide-left",
  "slide-right",
  "zoom-in",
  "zoom-out",
  "none",
];

/** Matches the per-type motion defaults the previous homepage used. */
const TYPE_DEFAULTS: Partial<Record<HomepageSectionType, RevealVariant>> = {
  hero: "zoom-in",
  products: "fade-up",
  categories: "fade-up",
  story: "slide-left",
  promotion: "slide-right",
  banner: "slide-right",
  trust: "fade-up",
  testimonials: "fade-up",
  faq: "fade-up",
  logos: "none",
};

function resolveAnimation(section: SectionRenderProps["section"]): RevealVariant {
  const configured = String(section.settings.animation || "").toLowerCase();
  if (KNOWN_ANIMATIONS.includes(configured as RevealVariant)) {
    return configured as RevealVariant;
  }
  return TYPE_DEFAULTS[section.type] ?? "fade-up";
}

interface HomepageRendererProps {
  config: HomepageConfig;
  mode?: "view" | "edit";
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  newSectionIds?: string[];
}

/**
 * Renders the configured sections in saved order using the variant registry.
 * Unknown types/variants render nothing rather than crashing the page.
 */
export default function HomepageRenderer({
  config,
  mode = "view",
  selectedId,
  onSelect,
  newSectionIds = [],
}: HomepageRendererProps) {
  const ordered = [...(config.sections || [])]
    .filter((section) => section.isEnabled !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  let heroRendered = false;

  return (
    <>
      {ordered.map((section, index) => {
        const resolved = resolveSectionComponent(section.type, section.variant);
        const definition = getSectionDefinition(section.type);
        const isHero = section.type === "hero";
        const level: 1 | 2 = isHero && !heroRendered ? 1 : 2;
        if (isHero && level === 1) heroRendered = true;

        const isSelected = selectedId === section.id;
        const isNew = newSectionIds.includes(section.id);

        if (!resolved) {
          if (mode !== "edit") return null;
          return (
            <div
              key={section.id}
              className="mx-auto my-4 max-w-3xl rounded-2xl border border-dashed border-error/40 bg-error/5 p-6 text-center text-xs font-semibold text-error"
            >
              Unknown section type “{section.type}” — it is hidden on the public page.
            </div>
          );
        }

        const { Component } = resolved;
        const renderProps: SectionRenderProps = {
          section,
          resources: config.resources,
          level,
          mode,
        };

        if (mode !== "edit") {
          return (
            <ScrollReveal
              key={section.id}
              variant={resolveAnimation(section)}
              delay={(index % 3) * 90}
            >
              <Component {...renderProps} />
            </ScrollReveal>
          );
        }

        const editorClasses = isSelected
          ? "outline outline-2 outline-primary outline-offset-[-2px]"
          : "hover:outline hover:outline-2 hover:outline-primary/40 hover:outline-offset-[-2px]";

        return (
          <div
            key={section.id}
            data-homepage-section={section.id}
            onClick={() => onSelect?.(section.id)}
            className={`relative cursor-pointer transition-[outline] ${editorClasses} ${
              isNew ? "ring-2 ring-success ring-offset-2" : ""
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect?.(section.id);
              }
            }}
            aria-label={`Select ${section.title || definition?.label || section.type}`}
          >
            <div className="pointer-events-none absolute left-2 top-2 z-20 flex items-center gap-1.5 rounded-full bg-base-100/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-base-content/70 shadow-md">
              <span>{definition?.label || section.type}</span>
              <span className="text-base-content/30">·</span>
              <span className="text-primary normal-case tracking-normal">{resolved.label}</span>
            </div>
            {/* Preview only: links/buttons in the rendered section must not
                fire while the admin is clicking to select a section. */}
            <div className="pointer-events-none">
              <Component {...renderProps} />
            </div>
          </div>
        );
      })}
    </>
  );
}
