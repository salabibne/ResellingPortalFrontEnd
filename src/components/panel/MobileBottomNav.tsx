"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { useActiveNav } from "./useActiveNav";

type NavIcon = ComponentType<{ size?: number | string; className?: string }>;

export interface BottomNavItem {
  label: string;
  icon: NavIcon;
  /** Internal route (highlighted when active) or external URL. */
  href?: string;
  /** Opens in a new tab and is never highlighted. */
  external?: boolean;
  /** Used instead of `href` for slots that open a drawer, cart, etc. */
  onClick?: () => void;
  badge?: number;
  /** For `onClick` slots that toggle an overlay. */
  expanded?: boolean;
}

export type BottomNavAccent = "primary" | "teal";

interface MobileBottomNavProps {
  /** Route of the raised centre button. */
  homeHref: string;
  homeLabel?: string;
  /** Print the label under the raised centre button. */
  showHomeLabel?: boolean;
  /** Colour of the centre button and the active slot. */
  accent?: BottomNavAccent;
  /** Exactly four slots: two left of the centre button, two right. */
  items: BottomNavItem[];
}

const ACCENT = {
  primary: {
    home: "bg-primary text-primary-content shadow-primary/30 focus-visible:ring-primary/50",
    active: "text-primary",
    activePill: "bg-primary/10",
    shadow: "shadow-[0_8px_30px_rgba(0,28,148,0.15)]",
  },
  teal: {
    home: "bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-teal-700/30 focus-visible:ring-teal-500/50",
    active: "text-teal-700",
    activePill: "bg-teal-500/10",
    shadow: "shadow-[0_8px_30px_rgba(15,118,110,0.18)]",
  },
} as const;

/**
 * Phone-only floating bottom navigation shared by the storefront, reseller
 * portal and admin panel. Pages that render it must reserve bottom space
 * (`pb-28 lg:pb-*`) so the bar never covers content.
 */
export default function MobileBottomNav({
  homeHref,
  homeLabel = "Home",
  showHomeLabel = false,
  accent = "primary",
  items,
}: MobileBottomNavProps) {
  const colors = ACCENT[accent];
  const pathname = usePathname() || "/";
  const linkHrefs = items
    .filter((item) => item.href && !item.external)
    .map((item) => item.href as string);
  const activeHref = useActiveNav(linkHrefs);
  const homeActive =
    (pathname.replace(/\/+$/, "") || "/") === (homeHref.replace(/\/+$/, "") || "/");

  const left = items.slice(0, 2);
  const right = items.slice(2, 4);

  return (
    <nav
      aria-label="Quick navigation"
      className="lg:hidden fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pointer-events-none print:hidden"
    >
      <div className={`pointer-events-auto relative mx-auto max-w-md h-16 grid grid-cols-5 rounded-2xl bg-base-100 border border-base-200 ${colors.shadow}`}>
        {left.map((item) => (
          <Slot
            key={item.label}
            item={item}
            accent={accent}
            active={!homeActive && !!item.href && item.href === activeHref}
          />
        ))}

        <div className="flex flex-col items-center">
          <Link
            href={homeHref}
            aria-label={homeLabel}
            aria-current={homeActive ? "page" : undefined}
            className={`-mt-7 w-[4.25rem] h-[4.25rem] shrink-0 rounded-full border-4 border-base-100 shadow-lg flex items-center justify-center transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${colors.home}`}
          >
            <span className="w-12 h-12 rounded-full border-2 border-white/80 flex items-center justify-center">
              <Home size={24} />
            </span>
          </Link>
          {showHomeLabel && (
            <span
              className={`-mt-0.5 text-[11px] font-semibold leading-none ${
                homeActive ? colors.active : "text-base-content/60"
              }`}
            >
              {homeLabel}
            </span>
          )}
        </div>

        {right.map((item) => (
          <Slot
            key={item.label}
            item={item}
            accent={accent}
            active={!homeActive && !!item.href && item.href === activeHref}
          />
        ))}
      </div>
    </nav>
  );
}

function Slot({
  item,
  active,
  accent,
}: {
  item: BottomNavItem;
  active: boolean;
  accent: BottomNavAccent;
}) {
  const Icon = item.icon;
  const colors = ACCENT[accent];
  const className = `flex flex-col items-center justify-center gap-1 min-w-0 rounded-2xl text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
    active ? colors.active : "text-base-content/60 hover:text-base-content"
  }`;

  const content = (
    <>
      <span
        className={`relative flex items-center justify-center w-10 h-7 rounded-full transition-colors ${
          active ? colors.activePill : ""
        }`}
      >
        <Icon size={20} />
        {typeof item.badge === "number" && item.badge > 0 && (
          <span className="absolute -top-1.5 right-0 inline-flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-error text-white text-[10px] font-bold leading-none">
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        )}
      </span>
      <span className="max-w-full truncate px-1">{item.label}</span>
    </>
  );

  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        aria-expanded={item.expanded}
        className={className}
      >
        {content}
      </button>
    );
  }

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link
      href={item.href || "/"}
      aria-current={active ? "page" : undefined}
      className={className}
    >
      {content}
    </Link>
  );
}
