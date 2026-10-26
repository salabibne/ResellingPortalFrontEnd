"use client";

import { useEffect, useRef } from "react";
import type { ComponentType } from "react";

export interface PanelTab {
  id: string;
  label: string;
  icon?: ComponentType<{ size?: number | string; className?: string }>;
  count?: number;
}

interface PanelTabsProps {
  tabs: PanelTab[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  ariaLabel?: string;
}

export default function PanelTabs({
  tabs,
  value,
  onChange,
  className = "",
  ariaLabel,
}: PanelTabsProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    refs.current[value]?.scrollIntoView({
      inline: "nearest",
      block: "nearest",
    });
  }, [value]);

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex gap-1 p-1 bg-base-200 rounded-xl overflow-x-auto scrollbar-none ${className}`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[tab.id] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`h-9 px-3.5 rounded-lg text-sm font-semibold whitespace-nowrap inline-flex items-center gap-2 transition-colors ${
              active
                ? "bg-primary text-white shadow-sm"
                : "text-base-content/70 hover:bg-base-100 hover:text-base-content"
            }`}
          >
            {Icon && <Icon size={16} />}
            {tab.label}
            {typeof tab.count === "number" && (
              <span
                className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-bold ${
                  active ? "bg-white/20 text-white" : "bg-base-100 text-base-content/70"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
