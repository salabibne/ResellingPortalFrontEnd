/**
 * Shared panel design system (admin + reseller).
 *
 * Token conventions — use these everywhere:
 * - Radius: cards/panels `rounded-2xl`; modals `rounded-2xl`; buttons, inputs,
 *   tabs `rounded-xl`; badges `rounded-full`.
 * - Card: `bg-base-100 rounded-2xl border border-base-200 shadow-sm`.
 * - Text: headings `text-base-content`; muted `text-base-content/60`.
 * - Page spacing: `flex flex-col gap-6`.
 * - Buttons: `btn btn-sm rounded-xl gap-2` (page header/toolbar); `btn-xs` in
 *   table rows. Icons `size={16}` (`size={14}` for `btn-xs`).
 */

export { default as PanelPage } from "./PanelPage";
export { default as PanelPageHeader } from "./PanelPageHeader";
export { default as PanelButton } from "./PanelButton";
export { default as PanelTabs } from "./PanelTabs";
export { default as PanelModal } from "./PanelModal";
export { default as PanelCard } from "./PanelCard";
export { default as PanelTable } from "./PanelTable";
export { default as PanelEmpty } from "./PanelEmpty";
export { default as PanelSkeleton } from "./PanelSkeleton";
export { default as StatusBadge } from "./StatusBadge";
export { default as PanelSidebar } from "./PanelSidebar";
export { default as PanelShell } from "./PanelShell";
export { useActiveNav } from "./useActiveNav";

export type { PanelTab } from "./PanelTabs";
export type { PanelButtonVariant } from "./PanelButton";
export type { PanelTheme, PanelNavItem, PanelNavGroup, PanelNavEntry } from "./PanelSidebar";
