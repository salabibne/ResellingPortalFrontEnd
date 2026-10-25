import type { CSSProperties, ReactNode } from "react";

const WIDTH_CLASS: Record<string, string> = {
  narrow: "max-w-3xl",
  normal: "max-w-5xl",
  wide: "max-w-7xl",
  full: "max-w-none",
};

const COLOR_TOKEN: Record<string, string> = {
  primary: "hsl(var(--p))",
  secondary: "hsl(var(--s))",
  accent: "hsl(var(--a))",
  neutral: "hsl(var(--n))",
  "base-100": "hsl(var(--b1))",
  "base-200": "hsl(var(--b2))",
  "base-300": "hsl(var(--b3))",
  "base-content": "hsl(var(--bc))",
};

/** Accepts a hex colour or an approved daisyUI token. */
export function resolveColor(value?: string): string | undefined {
  if (!value) return undefined;
  if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) return value;
  return COLOR_TOKEN[value];
}

export function spacing(value?: number): string | undefined {
  if (value === undefined || value === null) return undefined;
  return `${Math.min(Math.max(value, 0), 24) * 0.25}rem`;
}

export function alignmentClass(alignment?: string) {
  if (alignment === "center") return "text-center items-center";
  if (alignment === "right") return "text-right items-end";
  return "text-left items-start";
}

interface SectionFrameProps {
  section: {
    settings: {
      background?: string;
      textColor?: string;
      paddingTop?: number;
      paddingBottom?: number;
      contentWidth?: string;
    };
  };
  children: ReactNode;
  fullBleed?: boolean;
  className?: string;
}

/**
 * Applies admin-configured spacing, colour tokens and content width.
 * Never renders editor chrome — the renderer adds that around it.
 */
export default function SectionFrame({
  section,
  children,
  fullBleed = false,
  className = "",
}: SectionFrameProps) {
  const { settings } = section;

  const style: CSSProperties = {
    backgroundColor: resolveColor(settings.background),
    color: resolveColor(settings.textColor),
    paddingTop: spacing(settings.paddingTop),
    paddingBottom: spacing(settings.paddingBottom),
  };

  const width = WIDTH_CLASS[settings.contentWidth || "wide"] || WIDTH_CLASS.wide;

  if (fullBleed) {
    return (
      <section style={style} className={className}>
        {children}
      </section>
    );
  }

  return (
    <section style={style} className={className}>
      <div className={`mx-auto w-full px-4 sm:px-6 md:px-8 ${width}`}>{children}</div>
    </section>
  );
}
