import { parseIconValue } from "./icon-library";

interface DynamicIconProps {
  /** Stored icon value: a Lucide name, "emoji:…", or "none". */
  value?: string | null;
  /** Used when `value` is empty or unknown. Omit to render nothing in that case. */
  fallback?: string;
  size?: number;
  className?: string;
}

/** Renders an admin-assigned homepage icon (Lucide or emoji). */
export default function DynamicIcon({ value, fallback, size = 20, className }: DynamicIconProps) {
  const parsed = parseIconValue(value) ?? parseIconValue(fallback);
  if (!parsed || parsed.kind === "none") return null;

  if (parsed.kind === "emoji") {
    return (
      <span
        aria-hidden="true"
        className={`inline-flex items-center justify-center leading-none ${className ?? ""}`}
        style={{ fontSize: size, width: size, height: size }}
      >
        {parsed.emoji}
      </span>
    );
  }

  const { Icon } = parsed;
  return <Icon size={size} className={className} aria-hidden="true" />;
}
