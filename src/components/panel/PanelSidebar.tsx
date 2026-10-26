"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  X,
  type LucideIcon,
} from "lucide-react";
import { useActiveNav } from "./useActiveNav";

export type PanelTheme = "dark" | "light";

export interface PanelNavItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  badge?: number;
}

export interface PanelNavGroup {
  id: string;
  label: string;
  icon?: LucideIcon;
  items: PanelNavItem[];
}

export type PanelNavEntry = PanelNavItem | PanelNavGroup;

interface PanelSidebarProps {
  theme: PanelTheme;
  brand: ReactNode;
  topSlot?: ReactNode;
  items: PanelNavEntry[];
  footer?: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

function isGroup(entry: PanelNavEntry): entry is PanelNavGroup {
  return (entry as PanelNavGroup).items !== undefined;
}

export default function PanelSidebar({
  theme,
  brand,
  topSlot,
  items,
  footer,
  isOpen = false,
  onClose,
}: PanelSidebarProps) {
  const pathname = usePathname();
  const allHrefs = items.flatMap((entry) =>
    isGroup(entry) ? entry.items.map((item) => item.href) : [entry.href]
  );
  const activeHref = useActiveNav(allHrefs);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const seed: Record<string, boolean> = {};
    for (const entry of items) {
      if (isGroup(entry)) {
        seed[entry.id] = entry.items.some((item) => item.href === activeHref);
      }
    }
    return seed;
  });

  // Auto-open the group that holds the active route on navigation. Manual
  // collapse/expand is otherwise preserved until the next navigation.
  useEffect(() => {
    setOpenGroups((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const entry of items) {
        if (!isGroup(entry)) continue;
        const hasActive = entry.items.some((item) => item.href === activeHref);
        if (hasActive && !next[entry.id]) {
          next[entry.id] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, activeHref]);

  const activeClasses =
    theme === "dark" ? "bg-primary text-white" : "bg-primary text-primary-content";
  const inactiveClasses =
    theme === "dark"
      ? "text-white/75 hover:bg-white/10 hover:text-white"
      : "text-base-content/80 hover:bg-base-200";
  const groupActiveClasses =
    theme === "dark" ? "text-white bg-white/10" : "text-base-content bg-base-200";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 h-screen flex flex-col border-r transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } ${
        theme === "dark"
          ? "bg-black text-white border-white/10"
          : "bg-base-100 text-base-content border-base-200 shadow-sm"
      }`}
    >
      <div
        className={`px-4 py-4 border-b flex items-center justify-between gap-2 ${
          theme === "dark" ? "border-white/10" : "border-base-200"
        }`}
      >
        <div className="min-w-0">{brand}</div>
        <button
          type="button"
          onClick={onClose}
          className={`btn btn-ghost btn-sm btn-square rounded-xl lg:hidden ${
            theme === "dark" ? "text-white/70 hover:bg-white/10 hover:text-white" : ""
          }`}
          aria-label="Close navigation menu"
        >
          <X size={16} />
        </button>
      </div>

      {topSlot}

      <nav className="flex-1 min-h-0 overflow-y-auto p-3">
        <ul className="space-y-1">
          {items.map((entry) => {
            if (isGroup(entry)) {
              const GroupIcon = entry.icon;
              const hasActive = entry.items.some((item) => item.href === activeHref);
              const open = !!openGroups[entry.id];
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroups((prev) => ({ ...prev, [entry.id]: !prev[entry.id] }))
                    }
                    aria-expanded={open}
                    title={entry.label}
                    className={`flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium w-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                      hasActive ? groupActiveClasses : inactiveClasses
                    }`}
                  >
                    <span className="w-5 shrink-0 flex items-center justify-center">
                      {GroupIcon && <GroupIcon size={18} />}
                    </span>
                    <span className="flex-1 min-w-0 truncate text-left">{entry.label}</span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden min-h-0">
                      <ul className="space-y-1 mt-1">
                        {entry.items.map((item) => (
                          <li key={item.href}>
                            <NavRow
                              item={item}
                              active={item.href === activeHref}
                              activeClasses={activeClasses}
                              inactiveClasses={inactiveClasses}
                              onNavigate={onClose}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            }

            return (
              <li key={entry.href}>
                <NavRow
                  item={entry}
                  active={entry.href === activeHref}
                  activeClasses={activeClasses}
                  inactiveClasses={inactiveClasses}
                  onNavigate={onClose}
                />
              </li>
            );
          })}
        </ul>
      </nav>

      {footer && (
        <div
          className={`p-4 border-t ${
            theme === "dark" ? "border-white/10" : "border-base-200"
          }`}
        >
          {footer}
        </div>
      )}
    </aside>
  );
}

interface NavRowProps {
  item: PanelNavItem;
  active: boolean;
  activeClasses: string;
  inactiveClasses: string;
  onNavigate?: () => void;
}

function NavRow({ item, active, activeClasses, inactiveClasses, onNavigate }: NavRowProps) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={item.label}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium w-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
        active ? activeClasses : inactiveClasses
      }`}
    >
      <span className="w-5 shrink-0 flex items-center justify-center">
        {Icon && <Icon size={18} />}
      </span>
      <span className="flex-1 min-w-0 truncate">{item.label}</span>
      {typeof item.badge === "number" && item.badge > 0 && (
        <span
          className={`ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-bold ${
            active ? "bg-base-100 text-primary" : "bg-primary text-primary-content"
          }`}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}
