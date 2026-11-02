"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Layers,
  LayoutTemplate,
  Plus,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";
import {
  PanelEmpty,
  PanelModal,
  PanelPage,
  PanelPageHeader,
  PanelSkeleton,
  PanelTable,
  StatusBadge,
} from "@/components/panel";
import customPagesApi, { CustomPage, CustomPageStatus } from "@/services/customPages.api";
import RichTextEditor from "@/components/ui/RichTextEditor";

/** Page-level fields edited here; sections are edited in the page builder. */
type PageSettings = Pick<
  CustomPage,
  | "title"
  | "slug"
  | "content"
  | "metaTitle"
  | "metaDescription"
  | "status"
  | "buttonTitle"
  | "buttonLink"
> & { id?: string; isSystem?: boolean };

const EMPTY_PAGE: PageSettings = {
  title: "",
  slug: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
  status: "DRAFT",
  buttonTitle: "",
  buttonLink: "",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-");
}

function builderHref(id: string): string {
  return `/admin/custom-pages/${id}/builder`;
}

export default function AdminCustomPagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [editing, setEditing] = useState<PageSettings | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customPagesApi.getAll({ search, status: statusFilter });
      // The home page lives in the Homepage Builder, never in this list.
      setPages((data || []).filter((page) => page.slug !== "home"));
    } catch (err) {
      console.error("Failed to fetch custom pages", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const openCreate = () => {
    setEditing({ ...EMPTY_PAGE });
    setSlugTouched(false);
    setError(null);
  };

  const openSettings = (page: CustomPage) => {
    setEditing({
      id: page.id,
      isSystem: page.isSystem,
      title: page.title,
      slug: page.slug,
      content: page.content || "",
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      status: page.status,
      buttonTitle: page.buttonTitle || "",
      buttonLink: page.buttonLink || "",
    });
    setSlugTouched(true);
    setError(null);
  };

  const update = (patch: Partial<PageSettings>) =>
    setEditing((current) => (current ? { ...current, ...patch } : current));

  const handleDelete = async (page: CustomPage) => {
    if (page.isSystem) return;
    if (!confirm(`Delete “${page.title}”? Its sections are deleted too.`)) return;
    try {
      await customPagesApi.delete(page.id);
      fetchPages();
    } catch (err) {
      console.error("Failed to delete page", err);
      alert("Failed to delete page");
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    if (!editing.title.trim() || !editing.slug.trim()) {
      setError("Title and slug are required.");
      return;
    }

    setSaving(true);
    setError(null);
    const { id, isSystem, ...fields } = editing;
    try {
      if (id) {
        await customPagesApi.update(id, fields);
        setEditing(null);
        fetchPages();
      } else {
        // A new page goes straight into the builder to add its sections.
        const created = await customPagesApi.create(fields);
        setEditing(null);
        router.push(builderHref(created.id));
      }
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(
        Array.isArray(message) ? message.join(", ") : message || "Failed to save the page.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <PanelPage>
      <PanelPageHeader
        title="Custom Pages"
        subtitle="Landing and info pages built with the same sections, designs and icons as the homepage."
        icon={Layers}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="btn btn-primary btn-sm rounded-xl gap-2 text-white"
          >
            <Plus size={16} /> New page
          </button>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-base-200 bg-base-100 p-3 shadow-sm sm:flex-row sm:items-center">
        <label className="input input-bordered input-sm flex items-center gap-2 rounded-xl sm:flex-1">
          <Search size={14} className="shrink-0 text-base-content/50" />
          <input
            type="search"
            placeholder="Search by title or slug"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-w-0"
            aria-label="Search pages"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="select select-bordered select-sm rounded-xl sm:w-48"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <p className="flex flex-wrap items-center gap-1.5 text-xs text-base-content/60">
        <LayoutTemplate size={14} className="shrink-0 text-primary" />
        The site home page is edited in the
        <Link href="/admin/homepage" className="link link-primary font-semibold">
          Homepage Builder
        </Link>
        .
      </p>

      {loading ? (
        <PanelSkeleton variant="table" />
      ) : pages.length === 0 ? (
        <PanelEmpty
          icon={Layers}
          title="No custom pages"
          text="Create a page, then design it with sections in the page builder."
        />
      ) : (
        <PanelTable>
          <thead>
            <tr>
              <th>Page</th>
              <th>Status</th>
              <th>Sections</th>
              <th className="text-right !pr-4 whitespace-nowrap sticky right-0 bg-slate-50 z-10 shadow-[-6px_0_8px_-6px_rgba(15,23,42,0.12)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id}>
                <td className="min-w-[200px]">
                  <div className="font-semibold">{page.title}</div>
                  <div className="font-mono text-[11px] text-base-content/50">
                    /pages/{page.slug}
                    {page.isSystem && (
                      <span className="badge badge-outline badge-primary badge-xs ml-2 align-middle">
                        System
                      </span>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap">
                  <StatusBadge status={page.status} />
                </td>
                <td className="whitespace-nowrap text-sm text-base-content/70">
                  {page._count?.sections ?? 0}
                </td>
                <td className="text-right !pr-4 whitespace-nowrap sticky right-0 bg-base-100 z-10 shadow-[-6px_0_8px_-6px_rgba(15,23,42,0.12)]">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={builderHref(page.id)}
                      className="btn btn-xs btn-primary rounded-lg gap-1 flex-nowrap whitespace-nowrap text-white"
                      title="Edit sections, designs and icons"
                    >
                      <LayoutTemplate size={14} className="shrink-0" /> Design
                    </Link>
                    <button
                      type="button"
                      onClick={() => openSettings(page)}
                      className="btn btn-xs btn-ghost rounded-lg gap-1 flex-nowrap whitespace-nowrap"
                      title="Title, URL, status and SEO"
                    >
                      <Settings2 size={14} className="shrink-0" /> Settings
                    </button>
                    <a
                      href={`/pages/${page.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-xs btn-ghost btn-square rounded-lg"
                      title="View public page"
                      aria-label={`View ${page.title}`}
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(page)}
                      disabled={page.isSystem}
                      className="btn btn-xs btn-ghost btn-square rounded-lg text-error"
                      title={page.isSystem ? "System pages cannot be deleted" : "Delete page"}
                      aria-label={`Delete ${page.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </PanelTable>
      )}

      <PanelModal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Page settings" : "New page"}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="btn btn-ghost btn-sm rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="custom-page-form"
              disabled={saving}
              className="btn btn-primary btn-sm rounded-xl gap-2 text-white"
            >
              {saving && <span className="loading loading-spinner loading-xs" />}
              {editing?.id ? "Save settings" : "Create & design"}
            </button>
          </>
        }
      >
        {editing && (
          <form id="custom-page-form" onSubmit={handleSave} className="flex flex-col gap-4">
            {error && (
              <p role="alert" className="rounded-xl bg-error/10 px-3 py-2 text-xs font-semibold text-error">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="form-control">
                <span className="label-text text-xs font-bold">Page title *</span>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) =>
                    update({
                      title: e.target.value,
                      ...(slugTouched || editing.isSystem ? {} : { slug: slugify(e.target.value) }),
                    })
                  }
                  placeholder="e.g. Eid Special Campaign"
                  className="input input-bordered input-sm mt-1 rounded-xl"
                  required
                />
              </label>
              <label className="form-control">
                <span className="label-text text-xs font-bold">URL slug *</span>
                <input
                  type="text"
                  value={editing.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    update({ slug: slugify(e.target.value) });
                  }}
                  placeholder="eid-special-campaign"
                  disabled={editing.isSystem}
                  className="input input-bordered input-sm mt-1 rounded-xl font-mono"
                  required
                />
                <span className="mt-1 text-[10px] text-base-content/50">
                  Live at /pages/{editing.slug || "…"}
                </span>
              </label>
            </div>

            <label className="form-control">
              <span className="label-text text-xs font-bold">Status</span>
              <select
                value={editing.status}
                onChange={(e) => update({ status: e.target.value as CustomPageStatus })}
                className="select select-bordered select-sm mt-1 rounded-xl md:w-1/2"
              >
                <option value="DRAFT">Draft (hidden)</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived (hidden)</option>
              </select>
              <span className="mt-1 text-[10px] text-base-content/50">
                Publishing from the page builder also sets the page to Published.
              </span>
            </label>

            <fieldset className="grid grid-cols-1 gap-3 rounded-2xl border border-base-200 p-3 md:grid-cols-2">
              <legend className="px-1 text-[11px] font-black uppercase tracking-wider text-base-content/50">
                Top announcement bar (optional)
              </legend>
              <label className="form-control">
                <span className="label-text text-xs font-bold">Button text</span>
                <input
                  type="text"
                  value={editing.buttonTitle || ""}
                  onChange={(e) => update({ buttonTitle: e.target.value })}
                  placeholder="Shop now"
                  className="input input-bordered input-sm mt-1 rounded-xl"
                />
              </label>
              <label className="form-control">
                <span className="label-text text-xs font-bold">Button link</span>
                <input
                  type="text"
                  value={editing.buttonLink || ""}
                  onChange={(e) => update({ buttonLink: e.target.value })}
                  placeholder="/shop"
                  className="input input-bordered input-sm mt-1 rounded-xl"
                />
              </label>
            </fieldset>

            <fieldset className="flex flex-col gap-3 rounded-2xl border border-base-200 p-3">
              <legend className="px-1 text-[11px] font-black uppercase tracking-wider text-base-content/50">
                SEO
              </legend>
              <label className="form-control">
                <span className="label-text text-xs font-bold">Meta title</span>
                <input
                  type="text"
                  value={editing.metaTitle || ""}
                  onChange={(e) => update({ metaTitle: e.target.value })}
                  placeholder="e.g. Eid Deals - Aarham Apparel"
                  className="input input-bordered input-sm mt-1 rounded-xl"
                />
              </label>
              <label className="form-control">
                <span className="label-text text-xs font-bold">Meta description</span>
                <textarea
                  value={editing.metaDescription || ""}
                  onChange={(e) => update({ metaDescription: e.target.value })}
                  placeholder="Shown in search results and under the page title."
                  className="textarea textarea-bordered mt-1 h-16 rounded-xl text-sm"
                />
              </label>
            </fieldset>

            <div className="flex flex-col gap-1">
              <span className="label-text text-xs font-bold">Rich text (optional)</span>
              <span className="text-[10px] text-base-content/50">
                Shown above the sections. Use the page builder for layout and design.
              </span>
              <RichTextEditor
                value={editing.content || ""}
                onChange={(value) => update({ content: value })}
                placeholder="Free text such as terms or a long description…"
              />
            </div>
          </form>
        )}
      </PanelModal>
    </PanelPage>
  );
}
