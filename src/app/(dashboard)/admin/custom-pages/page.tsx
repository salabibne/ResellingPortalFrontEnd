"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  GripVertical,
  CheckCircle,
  Clock,
  Archive,
  ArrowUp,
  ArrowDown,
  X,
  Layers,
  Sparkles,
} from "lucide-react";
import customPagesApi, {
  CustomPage,
  CustomPageSection,
  CustomPageStatus,
} from "@/services/customPages.api";
import RichTextEditor from "@/components/ui/RichTextEditor";

export default function AdminCustomPagesPage() {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Drawer / Editor state
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingPage, setEditingPage] = useState<Partial<CustomPage> | null>(null);
  const [sections, setSections] = useState<Partial<CustomPageSection>[]>([]);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchPages();
  }, [search, statusFilter]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const data = await customPagesApi.getAll({
        search,
        status: statusFilter,
      });
      setPages(data);
    } catch (err) {
      console.error("Failed to fetch custom pages", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPage({
      title: "",
      slug: "",
      content: "",
      metaTitle: "",
      metaDescription: "",
      status: "DRAFT",
      buttonTitle: "Shop Now",
      buttonLink: "/shop",
    });
    setSections([]);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (page: CustomPage) => {
    setEditingPage(page);
    setSections(page.sections || []);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string, isSystem?: boolean) => {
    if (isSystem) {
      alert("System pages cannot be deleted!");
      return;
    }
    if (!confirm("Are you sure you want to delete this custom page?")) return;
    try {
      await customPagesApi.delete(id);
      fetchPages();
    } catch (err) {
      console.error("Failed to delete page", err);
      alert("Failed to delete page");
    }
  };

  const handleTitleChange = (val: string) => {
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-");
    setEditingPage((prev) => ({
      ...prev,
      title: val,
      slug: prev?.isSystem ? prev.slug : generatedSlug,
    }));
  };

  const handleAddSection = (type: string) => {
    const newSec: Partial<CustomPageSection> = {
      title: `${type} Section`,
      subtitle: "",
      description: "",
      imageUrl: "",
      buttonText: "Learn More",
      buttonLink: "#",
      sortOrder: sections.length + 1,
      content: { type },
    };
    setSections((prev) => [...prev, newSec]);
  };

  const handleRemoveSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    )
      return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((sec, idx) => ({ ...sec, sortOrder: idx + 1 }));
    setSections(reordered);
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage?.title || !editingPage?.slug) {
      alert("Title and Slug are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...editingPage,
        sections,
      } as any;

      if (editingPage.id) {
        await customPagesApi.update(editingPage.id, payload);
      } else {
        await customPagesApi.create(payload);
      }
      setIsDrawerOpen(false);
      fetchPages();
    } catch (err) {
      console.error("Failed to save custom page", err);
      alert("Failed to save custom page.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-white text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <Layers className="w-7 h-7 text-primary" /> Dynamic Custom Pages
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Build, edit, and publish custom campaign landing pages with dynamic modular sections.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn btn-primary text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Custom Page
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-xs border border-gray-200">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search pages by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full pl-9 text-sm bg-white text-black"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-bordered text-sm w-full sm:w-auto bg-white text-black"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Data Table View */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading custom pages...</div>
        ) : pages.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No custom pages found. Click "+ Create Custom Page" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Sections</th>
                  <th>System Badge</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="font-semibold text-black">
                      {page.title}
                    </td>
                    <td className="text-xs font-mono text-gray-500">/pages/{page.slug}</td>
                    <td>
                      {page.status === "PUBLISHED" && (
                        <span className="badge badge-success gap-1 text-white text-xs">
                          <CheckCircle className="w-3 h-3" /> Published
                        </span>
                      )}
                      {page.status === "DRAFT" && (
                        <span className="badge badge-warning gap-1 text-xs">
                          <Clock className="w-3 h-3" /> Draft
                        </span>
                      )}
                      {page.status === "ARCHIVED" && (
                        <span className="badge badge-ghost gap-1 text-xs">
                          <Archive className="w-3 h-3" /> Archived
                        </span>
                      )}
                    </td>
                    <td className="text-sm text-gray-600">
                      {page._count?.sections ?? page.sections?.length ?? 0} Sections
                    </td>
                    <td>
                      {page.isSystem ? (
                        <span className="badge badge-outline badge-primary text-xs">
                          System Page
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Custom</span>
                      )}
                    </td>
                    <td className="text-right space-x-2">
                      <a
                        href={`/pages/${page.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-ghost btn-xs text-info"
                        title="View Public Page"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleOpenEdit(page)}
                        className="btn btn-ghost btn-xs text-primary"
                        title="Edit Page"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id, page.isSystem)}
                        className="btn btn-ghost btn-xs text-error"
                        disabled={page.isSystem}
                        title={page.isSystem ? "System page cannot be deleted" : "Delete Page"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Visual Section Builder Drawer */}
      {isDrawerOpen && editingPage && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-3xl bg-white text-black h-full shadow-2xl overflow-y-auto flex flex-col">
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-black flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {editingPage.id ? "Edit Custom Page" : "Create Custom Page"}
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="btn btn-sm btn-ghost btn-circle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body Form */}
            <form onSubmit={handleSavePage} className="p-6 space-y-6 flex-1 bg-white">
              {/* Basic Page Metadata */}
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-sm text-black">
                  Page Settings & Metadata
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text text-xs font-semibold text-black">Page Title *</label>
                    <input
                      type="text"
                      value={editingPage.title || ""}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. Eid Special Campaign"
                      className="input input-bordered w-full text-sm mt-1 bg-white text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="label-text text-xs font-semibold text-black">URL Slug *</label>
                    <input
                      type="text"
                      value={editingPage.slug || ""}
                      onChange={(e) =>
                        setEditingPage((prev) => ({ ...prev, slug: e.target.value }))
                      }
                      placeholder="eid-special-campaign"
                      disabled={editingPage.isSystem}
                      className="input input-bordered w-full text-sm mt-1 font-mono bg-white text-black"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text text-xs font-semibold text-black">Publish Status</label>
                    <select
                      value={editingPage.status || "DRAFT"}
                      onChange={(e) =>
                        setEditingPage((prev) => ({
                          ...prev,
                          status: e.target.value as CustomPageStatus,
                        }))
                      }
                      className="select select-bordered w-full text-sm mt-1 bg-white text-black"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label-text text-xs font-semibold text-black">CTA Button Title</label>
                      <input
                        type="text"
                        value={editingPage.buttonTitle || ""}
                        onChange={(e) =>
                          setEditingPage((prev) => ({ ...prev, buttonTitle: e.target.value }))
                        }
                        className="input input-bordered w-full text-sm mt-1 bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="label-text text-xs font-semibold text-black">CTA Link</label>
                      <input
                        type="text"
                        value={editingPage.buttonLink || ""}
                        onChange={(e) =>
                          setEditingPage((prev) => ({ ...prev, buttonLink: e.target.value }))
                        }
                        className="input input-bordered w-full text-sm mt-1 bg-white text-black"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label-text text-xs font-semibold text-black">SEO Meta Title</label>
                  <input
                    type="text"
                    value={editingPage.metaTitle || ""}
                    onChange={(e) =>
                      setEditingPage((prev) => ({ ...prev, metaTitle: e.target.value }))
                    }
                    placeholder="e.g. Eid Deals - Aarham Apparel"
                    className="input input-bordered w-full text-sm mt-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="label-text text-xs font-semibold text-black">SEO Meta Description</label>
                  <textarea
                    value={editingPage.metaDescription || ""}
                    onChange={(e) =>
                      setEditingPage((prev) => ({ ...prev, metaDescription: e.target.value }))
                    }
                    placeholder="Exclusive discounts on Eid collection..."
                    className="textarea textarea-bordered w-full text-sm mt-1 h-16 bg-white text-black"
                  />
                </div>
              </div>

              {/* Page WYSIWYG Content Block */}
              <div className="space-y-2">
                <label className="label-text text-xs font-semibold text-black">Page Rich Text Content</label>
                <RichTextEditor
                  value={editingPage.content || ""}
                  onChange={(val) => setEditingPage((prev) => ({ ...prev, content: val }))}
                  placeholder="Enter dynamic page HTML or rich body content..."
                />
              </div>

              {/* Dynamic Sections Manager */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-black">
                    Dynamic Page Sections ({sections.length})
                  </h3>
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-outline btn-xs flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add Section
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-20 menu p-2 shadow-lg bg-white text-black rounded-box w-52 text-xs border border-gray-200"
                    >
                      <li>
                        <button type="button" onClick={() => handleAddSection("Hero Header")}>
                          Hero Header Section
                        </button>
                      </li>
                      <li>
                        <button type="button" onClick={() => handleAddSection("Rich Text Block")}>
                          Rich Text Content Section
                        </button>
                      </li>
                      <li>
                        <button type="button" onClick={() => handleAddSection("Feature Cards Grid")}>
                          Feature Cards Grid
                        </button>
                      </li>
                      <li>
                        <button type="button" onClick={() => handleAddSection("Image Text Banner")}>
                          Image + Text Banner
                        </button>
                      </li>
                      <li>
                        <button type="button" onClick={() => handleAddSection("Action Button Block")}>
                          Action Button Section
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                {sections.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-300 rounded-lg">
                    No sections added yet. Click "+ Add Section" to customize this page layout.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sections.map((sec, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 relative shadow-xs text-black"
                      >
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-black">
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                            Section #{idx + 1}: {sec.title}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveSection(idx, "up")}
                              disabled={idx === 0}
                              className="btn btn-ghost btn-xs"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSection(idx, "down")}
                              disabled={idx === sections.length - 1}
                              className="btn btn-ghost btn-xs"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSection(idx)}
                              className="btn btn-ghost btn-xs text-error"
                              title="Remove Section"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="label-text text-[11px] font-medium text-black">Section Title</label>
                            <input
                              type="text"
                              value={sec.title || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSections((prev) =>
                                  prev.map((s, i) => (i === idx ? { ...s, title: val } : s))
                                );
                              }}
                              className="input input-bordered input-xs w-full mt-1 bg-white text-black"
                            />
                          </div>
                          <div>
                            <label className="label-text text-[11px] font-medium text-black">Subtitle</label>
                            <input
                              type="text"
                              value={sec.subtitle || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSections((prev) =>
                                  prev.map((s, i) => (i === idx ? { ...s, subtitle: val } : s))
                                );
                              }}
                              className="input input-bordered input-xs w-full mt-1 bg-white text-black"
                            />
                          </div>
                          <div>
                            <label className="label-text text-[11px] font-medium text-black">Image URL</label>
                            <input
                              type="text"
                              value={sec.imageUrl || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSections((prev) =>
                                  prev.map((s, i) => (i === idx ? { ...s, imageUrl: val } : s))
                                );
                              }}
                              placeholder="https://cdn.aarhamapparel.com/..."
                              className="input input-bordered input-xs w-full mt-1 bg-white text-black"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="label-text text-[11px] font-medium text-black">Button Text</label>
                              <input
                                type="text"
                                value={sec.buttonText || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSections((prev) =>
                                    prev.map((s, i) => (i === idx ? { ...s, buttonText: val } : s))
                                  );
                                }}
                                className="input input-bordered input-xs w-full mt-1 bg-white text-black"
                              />
                            </div>
                            <div>
                              <label className="label-text text-[11px] font-medium text-black">Button Link</label>
                              <input
                                type="text"
                                value={sec.buttonLink || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSections((prev) =>
                                    prev.map((s, i) => (i === idx ? { ...s, buttonLink: val } : s))
                                  );
                                }}
                                className="input input-bordered input-xs w-full mt-1 bg-white text-black"
                              />
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <label className="label-text text-[11px] font-medium text-black">Description</label>
                            <textarea
                              value={sec.description || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSections((prev) =>
                                  prev.map((s, i) => (i === idx ? { ...s, description: val } : s))
                                );
                              }}
                              className="textarea textarea-bordered textarea-xs w-full mt-1 h-12 bg-white text-black"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Controls */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-200 sticky bottom-0 bg-white p-4">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="btn btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary text-white text-xs px-6"
                >
                  {saving ? "Saving Page..." : "Save Custom Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
