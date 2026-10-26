"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/shared/Header";
import PanelSidebar, {
  type PanelNavEntry,
  type PanelTheme,
} from "./PanelSidebar";

interface PanelShellProps {
  theme: PanelTheme;
  brand: ReactNode;
  topSlot?: ReactNode;
  items: PanelNavEntry[];
  footer?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
}

export default function PanelShell({
  theme,
  brand,
  topSlot,
  items,
  footer,
  extra,
  children,
}: PanelShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes the drawer and body scroll is locked while it is open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="flex h-screen overflow-hidden bg-base-200/40">
      <div
        className={`fixed inset-0 z-40 bg-black/60 lg:hidden transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <PanelSidebar
        theme={theme}
        brand={brand}
        topSlot={topSlot}
        items={items}
        footer={footer}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          onToggleSidebar={() => setOpen((value) => !value)}
          sidebarOpen={open}
        />
        <main
          key={pathname}
          className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-6 animate-fade-in"
        >
          {children}
        </main>
      </div>
      {extra}
    </div>
  );
}
