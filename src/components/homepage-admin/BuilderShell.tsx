"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Layers,
  SlidersHorizontal,
} from "lucide-react";
import homepageApi from "@/services/homepage.api";
import type {
  HomepageConfig,
  HomepageResources,
  HomepageSection,
  HomepageSectionType,
} from "@/components/homepage/types";
import BuilderTopBar from "./BuilderTopBar";
import SectionList from "./SectionList";
import SectionLibrary from "./SectionLibrary";
import LivePreview from "./LivePreview";
import SectionEditor from "./SectionEditor";
import VariantSelector from "./VariantSelector";

const EMPTY_RESOURCES: HomepageResources = {
  products: {},
  categories: [],
  brands: [],
  productBrands: [],
};

function normalizeRow(raw: any): HomepageSection {
  return {
    id: raw.id,
    type: (raw.type || "banner") as HomepageSectionType,
    variant: raw.variant || "default",
    title: raw.title ?? "",
    subtitle: raw.subtitle ?? "",
    description: raw.description ?? "",
    imageUrl: raw.imageUrl ?? "",
    imageDescription: raw.imageDescription ?? "",
    buttonText: raw.buttonText ?? "",
    buttonLink: raw.buttonLink ?? "",
    settings:
      raw.settings && typeof raw.settings === "object" && !Array.isArray(raw.settings)
        ? raw.settings
        : {},
    isEnabled: raw.isEnabled !== false,
    sortOrder: Number(raw.sortOrder ?? 0),
  };
}

/** Sorts server data by its saved order and renumbers 1..n. */
function sortSections(list: HomepageSection[]): HomepageSection[] {
  return [...list]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((section, index) => ({ ...section, sortOrder: index + 1 }));
}

/**
 * Renumbers the array exactly as it is. Never sorts — moving a section swaps
 * array positions while the old sortOrder values are still attached, so sorting
 * here would immediately undo the move.
 */
function renumberSections(list: HomepageSection[]): HomepageSection[] {
  return list.map((section, index) => ({ ...section, sortOrder: index + 1 }));
}

function errorMessage(err: any, fallback: string): string {
  const message = err?.response?.data?.message ?? err?.message;
  if (Array.isArray(message)) return message.join(", ");
  return typeof message === "string" && message ? message : fallback;
}

type Tab = "sections" | "editor" | "preview";

const TABS: { id: Tab; label: string; icon: typeof Layers }[] = [
  { id: "sections", label: "Sections", icon: Layers },
  { id: "editor", label: "Editor", icon: SlidersHorizontal },
  { id: "preview", label: "Preview", icon: Eye },
];

export default function BuilderShell() {
  const [page, setPage] = useState<HomepageConfig["page"] | null>(null);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [resources, setResources] = useState<HomepageResources>(EMPTY_RESOURCES);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newIds, setNewIds] = useState<string[]>([]);
  const [dirtyIds, setDirtyIds] = useState<string[]>([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [hasUnpublished, setHasUnpublished] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [tab, setTab] = useState<Tab>("sections");

  const selectedSection = useMemo(
    () => sections.find((section) => section.id === selectedId) || null,
    [sections, selectedId],
  );

  const showToast = useCallback((text: string, type: "success" | "error" = "success") => {
    setToast({ type, text });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const load = useCallback(async (preferredIndex?: number) => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await homepageApi.getAdmin();
      const list = sortSections((data.sections || []).map(normalizeRow));
      setPage(data.page);
      setSections(list);
      setResources(data.resources || EMPTY_RESOURCES);
      setHasUnpublished(Boolean(data.hasUnpublishedChanges));
      setDirtyIds([]);
      setNewIds([]);
      setSelectedId(() => {
        if (preferredIndex !== undefined && list[preferredIndex]) {
          return list[preferredIndex].id;
        }
        return list[0]?.id ?? null;
      });
    } catch (err: any) {
      setLoadError(
        errorMessage(err, "Could not load the homepage draft. Check the API and retry."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (dirtyIds.length === 0) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirtyIds.length]);

  const markDirty = (id: string) =>
    setDirtyIds((current) => (current.includes(id) ? current : [...current, id]));

  const updateSectionLocal = (id: string, patch: Partial<HomepageSection>) => {
    setSections((current) =>
      current.map((section) => (section.id === id ? { ...section, ...patch } : section)),
    );
    markDirty(id);
  };

  const updateSettings = (id: string, patch: Record<string, unknown>) => {
    setSections((current) =>
      current.map((section) =>
        section.id === id
          ? { ...section, settings: { ...section.settings, ...patch } }
          : section,
      ),
    );
    markDirty(id);
  };

  const persistOrder = async (list: HomepageSection[]) => {
    try {
      await homepageApi.reorder(
        list.map((section, index) => ({ id: section.id, sortOrder: index + 1 })),
      );
      setHasUnpublished(true);
    } catch (err: any) {
      showToast(errorMessage(err, "Could not save the new order. Reloading."), "error");
      await load();
    }
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const index = sections.findIndex((section) => section.id === id);
    if (index < 0) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= sections.length) return;

    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    const renumbered = renumberSections(next);
    setSections(renumbered);
    void persistOrder(renumbered);
  };

  const handleReorder = (sourceId: string, targetId: string) => {
    const from = sections.findIndex((section) => section.id === sourceId);
    const to = sections.findIndex((section) => section.id === targetId);
    if (from < 0 || to < 0 || from === to) return;

    const next = [...sections];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const renumbered = renumberSections(next);
    setSections(renumbered);
    void persistOrder(renumbered);
  };

  const handleAdd = async (type: HomepageSectionType, variant: string) => {
    setAdding(true);
    try {
      const row = await homepageApi.createSection({ type, variant });
      const section = normalizeRow(row);
      setSections((current) => sortSections([...current, section]));
      setSelectedId(section.id);
      setNewIds((current) => [...current, section.id]);
      setHasUnpublished(true);
      setLibraryOpen(false);
      setTab("editor");
      showToast("Section added to the draft.");
    } catch (err: any) {
      showToast(errorMessage(err, "Could not add the section."), "error");
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (section: HomepageSection) => {
    const nextEnabled = !section.isEnabled;
    setPendingId(section.id);
    setSections((current) =>
      current.map((entry) =>
        entry.id === section.id ? { ...entry, isEnabled: nextEnabled } : entry,
      ),
    );

    try {
      await homepageApi.updateSection(section.id, { isEnabled: nextEnabled });
      setHasUnpublished(true);
      showToast(`“${section.title}” is now ${nextEnabled ? "visible" : "hidden"}.`);
    } catch (err: any) {
      setSections((current) =>
        current.map((entry) =>
          entry.id === section.id ? { ...entry, isEnabled: section.isEnabled } : entry,
        ),
      );
      showToast(errorMessage(err, "Could not update visibility."), "error");
    } finally {
      setPendingId(null);
    }
  };

  const handleDuplicate = async (section: HomepageSection) => {
    setPendingId(section.id);
    try {
      const row = await homepageApi.duplicateSection(section.id);
      const copy = normalizeRow(row);
      setSections((current) => sortSections([...current, copy]));
      setSelectedId(copy.id);
      setNewIds((current) => [...current, copy.id]);
      setHasUnpublished(true);
      showToast("Section duplicated.");
    } catch (err: any) {
      showToast(errorMessage(err, "Could not duplicate the section."), "error");
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (section: HomepageSection) => {
    if (!confirm(`Remove “${section.title || section.type}” from the draft?`)) return;
    setPendingId(section.id);
    try {
      await homepageApi.deleteSection(section.id);
      setSections((current) => sortSections(current.filter((entry) => entry.id !== section.id)));
      setDirtyIds((current) => current.filter((id) => id !== section.id));
      setNewIds((current) => current.filter((id) => id !== section.id));
      if (selectedId === section.id) setSelectedId(null);
      setHasUnpublished(true);
      showToast("Section removed.");
    } catch (err: any) {
      showToast(errorMessage(err, "Could not delete the section."), "error");
    } finally {
      setPendingId(null);
    }
  };

  const saveDraft = async (): Promise<boolean> => {
    if (dirtyIds.length === 0) return true;
    setSaving(true);
    const failed: string[] = [];

    for (const id of dirtyIds) {
      const section = sections.find((entry) => entry.id === id);
      if (!section) continue;
      try {
        await homepageApi.updateSection(id, {
          variant: section.variant,
          title: section.title,
          subtitle: section.subtitle,
          description: section.description,
          imageUrl: section.imageUrl,
          imageDescription: section.imageDescription,
          buttonText: section.buttonText,
          buttonLink: section.buttonLink,
          settings: section.settings as Record<string, unknown>,
        });
      } catch {
        failed.push(id);
      }
    }

    setSaving(false);
    setDirtyIds(failed);

    if (failed.length) {
      showToast(
        `${failed.length} section${failed.length > 1 ? "s" : ""} failed to save. Fix the issue and retry.`,
        "error",
      );
      return false;
    }

    setHasUnpublished(true);
    showToast("Draft saved.");
    return true;
  };

  const handlePublish = async () => {
    if (!(await saveDraft())) return;
    setPublishing(true);
    try {
      await homepageApi.publish();
      try {
        await fetch("/api/revalidate", { method: "POST" });
      } catch {
        // The storefront is force-dynamic, so this is only a cache hint.
      }
      const index = sections.findIndex((section) => section.id === selectedId);
      await load(index >= 0 ? index : undefined);
      setHasUnpublished(false);
      showToast("Published — the live homepage is updated.");
    } catch (err: any) {
      showToast(errorMessage(err, "Publishing failed. Your draft is still intact."), "error");
    } finally {
      setPublishing(false);
    }
  };

  const handleDiscard = async () => {
    if (
      !confirm(
        "Discard the draft and reload the published homepage? Unsaved edits in this draft will be lost.",
      )
    ) {
      return;
    }
    setDiscarding(true);
    try {
      await homepageApi.discard();
      await load();
      showToast("Draft discarded. The published layout was reloaded.");
    } catch (err: any) {
      showToast(errorMessage(err, "Could not discard the draft."), "error");
    } finally {
      setDiscarding(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Replace the draft with the factory section layout?")) return;
    setResetting(true);
    try {
      const data = await homepageApi.reset();
      const list = sortSections((data.sections || []).map(normalizeRow));
      setPage(data.page);
      setSections(list);
      setResources(data.resources || EMPTY_RESOURCES);
      setSelectedId(list[0]?.id ?? null);
      setDirtyIds([]);
      setNewIds([]);
      setHasUnpublished(true);
      showToast("Factory layout restored as a draft. Publish to make it live.");
    } catch (err: any) {
      showToast(errorMessage(err, "Could not reset the layout."), "error");
    } finally {
      setResetting(false);
    }
  };

  const previewConfig: HomepageConfig = {
    page: page || { id: "", title: "Home", slug: "home" },
    sections,
    resources,
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 pb-20">
      {toast && (
        <div className="fixed right-4 top-4 z-[80] max-w-xs">
          <div
            className={`alert ${
              toast.type === "success" ? "alert-success" : "alert-error"
            } rounded-2xl text-white shadow-xl`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span className="text-xs font-bold">{toast.text}</span>
          </div>
        </div>
      )}

      <BuilderTopBar
        dirtyCount={dirtyIds.length}
        hasUnpublishedChanges={hasUnpublished}
        saving={saving}
        publishing={publishing}
        discarding={discarding}
        resetting={resetting}
        onSave={() => void saveDraft()}
        onPublish={() => void handlePublish()}
        onDiscard={() => void handleDiscard()}
        onReset={() => void handleReset()}
        onShowPreview={() => setTab("preview")}
      />

      <div className="flex gap-1 rounded-xl border border-base-200 bg-base-100 p-1 xl:hidden">
        {TABS.map((entry) => {
          const Icon = entry.icon;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => setTab(entry.id)}
              className={`btn btn-sm flex-1 gap-1 rounded-lg ${
                tab === entry.id ? "btn-primary" : "btn-ghost"
              }`}
            >
              <Icon size={13} /> {entry.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row">
        <aside
          className={`${tab === "sections" ? "block" : "hidden"} xl:block xl:w-72 xl:shrink-0`}
        >
          <div className="xl:sticky xl:top-4 xl:h-[calc(100vh-9rem)]">
            <SectionList
              sections={sections}
              selectedId={selectedId}
              newIds={newIds}
              pendingId={pendingId}
              onSelect={(id) => {
                setSelectedId(id);
                setTab("editor");
              }}
              onToggle={handleToggle}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onMove={handleMove}
              onReorder={handleReorder}
              onAdd={() => setLibraryOpen(true)}
            />
          </div>
        </aside>

        <div className={`${tab === "preview" ? "block" : "hidden"} min-w-0 flex-1 xl:block`}>
          <div className="h-[70vh] xl:sticky xl:top-4 xl:h-[calc(100vh-9rem)]">
            <LivePreview
              config={previewConfig}
              selectedId={selectedId}
              newIds={newIds}
              onSelect={(id) => {
                setSelectedId(id);
                setTab("editor");
              }}
              loading={loading}
              error={loadError}
              onRetry={() => void load()}
            />
          </div>
        </div>

        <aside
          className={`${tab === "editor" ? "block" : "hidden"} xl:block xl:w-[380px] xl:shrink-0`}
        >
          <div className="max-h-[calc(100vh-9rem)] overflow-y-auto xl:sticky xl:top-4">
            {selectedSection ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 rounded-2xl border border-base-200 bg-base-100 p-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-extrabold">
                      {selectedSection.title || "Untitled section"}
                    </h3>
                    <p className="text-[10px] uppercase tracking-wider text-base-content/50">
                      {selectedSection.type} · {selectedSection.variant}
                    </p>
                  </div>
                  <span className="badge badge-xs badge-outline shrink-0">
                    #{selectedSection.sortOrder}
                  </span>
                </div>

                <VariantSelector
                  section={selectedSection}
                  onChange={(variant) => updateSectionLocal(selectedSection.id, { variant })}
                />

                <SectionEditor
                  section={selectedSection}
                  resources={resources}
                  onChange={(patch) => updateSectionLocal(selectedSection.id, patch)}
                  onSettings={(patch) => updateSettings(selectedSection.id, patch)}
                />

                <p className="rounded-xl bg-base-200/60 p-2.5 text-[10px] leading-relaxed text-base-content/60">
                  Edits are kept in this browser session until you press{" "}
                  <strong>Save draft</strong>. Publishing copies the saved draft over the live
                  homepage.
                </p>
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-100 p-6 text-center">
                <SlidersHorizontal size={20} className="mb-1 text-base-content/30" />
                <p className="text-xs font-semibold text-base-content/60">
                  Select a section to edit its content and design.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <SectionLibrary
        open={libraryOpen}
        adding={adding}
        onClose={() => setLibraryOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  );
}
