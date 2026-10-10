"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layout,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Edit2,
  Plus,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Grid,
  Info,
  Users,
  UserCheck,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  X,
} from "lucide-react";
import customPagesApi, {
  CustomPage,
  CustomPageSection,
} from "@/services/customPages.api";

export default function AdminHomepageManagerPage() {
  const [homePage, setHomePage] = useState<CustomPage | null>(null);
  const [sections, setSections] = useState<CustomPageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPriority, setSavingPriority] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Edit Modal State
  const [editingSection, setEditingSection] = useState<CustomPageSection | null>(
    null
  );
  const [savingSection, setSavingSection] = useState(false);

  // Add Custom Section Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSection, setNewSection] = useState({
    title: "",
    subtitle: "Custom Promo",
    description: "",
    imageUrl: "",
    buttonText: "Shop Now",
    buttonLink: "/shop",
    type: "custom_banner",
  });

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadHomePage = async () => {
    setLoading(true);
    try {
      const page = await customPagesApi.getBySlug("home");
      setHomePage(page);
      const sorted = (page.sections || []).sort(
        (a, b) => a.sortOrder - b.sortOrder
      );
      setSections(sorted);
    } catch (err: any) {
      console.error("Failed to load homepage sections:", err);
      showToast("Failed to load homepage layout", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomePage();
  }, []);

  // Section Reordering (Move Up / Down)
  const moveSection = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Recalculate 1-based sortOrder
    const reordered = newSections.map((sec, idx) => ({
      ...sec,
      sortOrder: idx + 1,
    }));

    setSections(reordered);
  };

  // Save All Priority Orders to Backend
  const handleSavePriority = async () => {
    if (!homePage) return;
    setSavingPriority(true);
    try {
      const payload = sections.map((sec, idx) => ({
        id: sec.id!,
        sortOrder: idx + 1,
      }));

      await customPagesApi.reorderSections(homePage.id, payload);
      showToast("Homepage section priority order saved successfully!");
    } catch (err: any) {
      console.error("Failed to save section order:", err);
      showToast(err?.message || "Failed to update priority order", "error");
    } finally {
      setSavingPriority(false);
    }
  };

  // Toggle Visibility (Active / Inactive)
  const handleToggleActive = async (sec: CustomPageSection) => {
    if (!sec.id) return;
    const currentContent = (sec.content as any) || {};
    const newActive = currentContent.isActive === false ? true : false;
    const updatedContent = { ...currentContent, isActive: newActive };

    // Optimistic UI update
    setSections((prev) =>
      prev.map((s) => (s.id === sec.id ? { ...s, content: updatedContent } : s))
    );

    try {
      await customPagesApi.updateSection(sec.id, {
        content: updatedContent,
      });
      showToast(
        `"${sec.title}" is now ${newActive ? "visible on" : "hidden from"} homepage.`
      );
    } catch (err: any) {
      console.error("Failed to toggle section visibility:", err);
      showToast("Failed to update section visibility", "error");
      loadHomePage(); // revert on failure
    }
  };

  // Reset to Factory Layout
  const handleResetLayout = async () => {
    if (
      !confirm(
        "Are you sure you want to restore the default factory homepage layout? Any custom order will be reset."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await customPagesApi.resetHomePage();
      await loadHomePage();
      showToast("Homepage layout restored to default successfully!");
    } catch (err: any) {
      console.error("Failed to reset homepage layout:", err);
      showToast("Failed to reset layout", "error");
      setLoading(false);
    }
  };

  // Save Content of Edited Section
  const handleSaveEditSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !editingSection.id) return;

    setSavingSection(true);
    try {
      await customPagesApi.updateSection(editingSection.id, {
        title: editingSection.title,
        subtitle: editingSection.subtitle,
        description: editingSection.description,
        imageUrl: editingSection.imageUrl,
        buttonText: editingSection.buttonText,
        buttonLink: editingSection.buttonLink,
        content: editingSection.content,
      });

      setSections((prev) =>
        prev.map((s) => (s.id === editingSection.id ? editingSection : s))
      );
      setEditingSection(null);
      showToast(`Section "${editingSection.title}" updated successfully!`);
    } catch (err: any) {
      console.error("Failed to update section:", err);
      showToast("Failed to update section content", "error");
    } finally {
      setSavingSection(false);
    }
  };

  // Create New Custom Section
  const handleCreateCustomSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homePage) return;

    try {
      const payload: Partial<CustomPageSection> = {
        title: newSection.title,
        subtitle: newSection.subtitle,
        description: newSection.description,
        imageUrl: newSection.imageUrl || undefined,
        buttonText: newSection.buttonText || undefined,
        buttonLink: newSection.buttonLink || undefined,
        sortOrder: sections.length + 1,
        content: { type: newSection.type, isActive: true },
      };

      await customPagesApi.addSection(homePage.id, payload);
      setIsAddModalOpen(false);
      setNewSection({
        title: "",
        subtitle: "Custom Promo",
        description: "",
        imageUrl: "",
        buttonText: "Shop Now",
        buttonLink: "/shop",
        type: "custom_banner",
      });
      await loadHomePage();
      showToast("New homepage section added successfully!");
    } catch (err: any) {
      console.error("Failed to add section:", err);
      showToast("Failed to add section", "error");
    }
  };

  // Delete Section
  const handleDeleteSection = async (secId: string, title: string) => {
    if (!confirm(`Are you sure you want to remove section "${title}"?`)) return;

    try {
      await customPagesApi.deleteSection(secId);
      setSections((prev) => prev.filter((s) => s.id !== secId));
      showToast(`Section "${title}" removed.`);
    } catch (err: any) {
      console.error("Failed to delete section:", err);
      showToast("Failed to delete section", "error");
    }
  };

  // Icon helper for section types
  const getSectionIcon = (type: string) => {
    switch (type) {
      case "hero":
        return <Layout className="text-blue-500" size={18} />;
      case "products":
        return <ShoppingBag className="text-emerald-500" size={18} />;
      case "features":
        return <Grid className="text-purple-500" size={18} />;
      case "about":
        return <Info className="text-amber-500" size={18} />;
      case "team":
        return <Users className="text-indigo-500" size={18} />;
      case "founder":
        return <UserCheck className="text-rose-500" size={18} />;
      default:
        return <Sparkles className="text-primary" size={18} />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`alert ${
              toastMessage.type === "success" ? "alert-success text-white" : "alert-error text-white"
            } shadow-xl rounded-2xl flex items-center gap-3`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span className="font-bold text-xs sm:text-sm">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-wider mb-2">
            <Layout size={16} /> Homepage Content & Order Customizer
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Homepage Section Priority Manager
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Control the visual order, customize content, and turn sections on or off. Changes reflect immediately on the live homepage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start md:self-auto">
          <Link
            href="/"
            target="_blank"
            className="btn btn-sm btn-outline text-white border-white/30 hover:bg-white/10 rounded-xl gap-1.5 font-bold"
          >
            <Eye size={14} /> Preview Live
          </Link>
          <button
            onClick={handleResetLayout}
            className="btn btn-sm btn-ghost text-slate-300 hover:text-white rounded-xl gap-1.5 font-bold"
            title="Reset to factory default section order"
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-sm btn-outline btn-primary rounded-xl gap-1.5 font-bold"
          >
            <Plus size={14} /> Add Custom Section
          </button>
          <button
            onClick={handleSavePriority}
            disabled={savingPriority || loading}
            className="btn btn-sm btn-primary rounded-xl gap-2 font-bold shadow-md shadow-primary/30"
          >
            {savingPriority ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <Save size={15} />
            )}
            Save Priority Order
          </button>
        </div>
      </div>

      {/* Section List Card Container */}
      <div className="bg-base-100 rounded-3xl border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-base-200 pb-3">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-base-content flex items-center gap-2">
              <span>Configured Homepage Sections</span>
              <span className="badge badge-sm badge-neutral font-mono">{sections.length} sections</span>
            </h2>
            <p className="text-xs text-base-content/60 mt-0.5">
              Use ▲ / ▼ arrows to move sections higher or lower in priority. Click Save Priority Order to persist changes.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-xs text-base-content/60 font-medium mt-3">
              Loading homepage section configuration...
            </p>
          </div>
        ) : sections.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Layout size={48} className="mx-auto text-base-content/30" />
            <h3 className="font-bold text-base">No homepage sections found</h3>
            <p className="text-xs text-base-content/60 max-w-sm mx-auto">
              Restore the standard layout to begin customizing your homepage.
            </p>
            <button
              onClick={handleResetLayout}
              className="btn btn-sm btn-primary rounded-xl font-bold"
            >
              Seed Default Homepage Layout
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((sec, idx) => {
              const content = (sec.content as any) || {};
              const secType = (content.type || sec.subtitle || "custom").toLowerCase();
              const isActive = content.isActive !== false;

              return (
                <div
                  key={sec.id || idx}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${
                    isActive
                      ? "bg-base-100 border-base-300 hover:border-primary/50 shadow-xs"
                      : "bg-base-200/40 border-dashed border-base-300 opacity-60"
                  }`}
                >
                  {/* Left: Priority Rank, Drag/Move Controls & Info */}
                  <div className="flex items-center gap-3">
                    {/* Priority Position Controls */}
                    <div className="flex flex-col items-center gap-1 bg-base-200/80 p-1 rounded-xl shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveSection(idx, "up")}
                        className="btn btn-ghost btn-xs btn-circle disabled:opacity-20"
                        title="Move Section Up (Higher Priority)"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <span className="font-mono font-black text-xs text-primary px-1.5">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        disabled={idx === sections.length - 1}
                        onClick={() => moveSection(idx, "down")}
                        className="btn btn-ghost btn-xs btn-circle disabled:opacity-20"
                        title="Move Section Down (Lower Priority)"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    {/* Section Type Icon & Details */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-base-200 shrink-0">
                          {getSectionIcon(secType)}
                        </div>
                        <h4 className="font-extrabold text-sm sm:text-base text-base-content">
                          {sec.title}
                        </h4>
                        <span className="badge badge-xs uppercase tracking-wider font-bold bg-base-200 text-base-content/70">
                          {sec.subtitle || secType}
                        </span>
                        {!isActive && (
                          <span className="badge badge-xs badge-error text-white font-bold">
                            Hidden
                          </span>
                        )}
                      </div>

                      {sec.description && (
                        <p className="text-xs text-base-content/60 line-clamp-1">
                          {sec.description}
                        </p>
                      )}

                      {sec.buttonText && (
                        <div className="text-[11px] text-primary font-semibold flex items-center gap-1">
                          <span>Button: &ldquo;{sec.buttonText}&rdquo; &rarr; {sec.buttonLink || "/shop"}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions (Toggle Active, Edit, Delete) */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(sec)}
                      className={`btn btn-xs rounded-xl font-bold gap-1.5 ${
                        isActive
                          ? "btn-success text-white"
                          : "btn-outline border-base-300 text-base-content/60"
                      }`}
                      title={isActive ? "Visible on Homepage" : "Hidden from Homepage"}
                    >
                      {isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{isActive ? "Visible" : "Hidden"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingSection(sec)}
                      className="btn btn-xs btn-outline btn-primary rounded-xl font-bold gap-1"
                    >
                      <Edit2 size={12} /> Edit Content
                    </button>

                    {/* Delete Custom Sections */}
                    {secType === "custom_banner" && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(sec.id!, sec.title)}
                        className="btn btn-xs btn-ghost text-error btn-circle"
                        title="Delete custom section"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── MODAL 1: EDIT SECTION CONTENT ───────────────────────────── */}
      {editingSection && (
        <div className="modal modal-open">
          <div className="modal-box w-full max-w-xl bg-base-100 p-6 rounded-3xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-base-200 pb-3">
              <div>
                <h3 className="font-bold text-lg text-base-content flex items-center gap-2">
                  <Edit2 size={18} className="text-primary" />
                  <span>Edit Section Content</span>
                </h3>
                <p className="text-xs text-base-content/60">
                  Update title, description, buttons, and display parameters.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditSection} className="space-y-4 text-xs">
              <div className="form-control">
                <label className="label font-bold text-base-content">
                  Section Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingSection.title}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, title: e.target.value })
                  }
                  className="input input-bordered input-sm w-full font-bold"
                />
              </div>

              <div className="form-control">
                <label className="label font-bold text-base-content">
                  Subtitle / Badge Label
                </label>
                <input
                  type="text"
                  value={editingSection.subtitle || ""}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, subtitle: e.target.value })
                  }
                  className="input input-bordered input-sm w-full"
                />
              </div>

              <div className="form-control">
                <label className="label font-bold text-base-content">
                  Body Description
                </label>
                <textarea
                  rows={3}
                  value={editingSection.description || ""}
                  onChange={(e) =>
                    setEditingSection({
                      ...editingSection,
                      description: e.target.value,
                    })
                  }
                  className="textarea textarea-bordered w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label font-bold text-base-content">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={editingSection.buttonText || ""}
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        buttonText: e.target.value,
                      })
                    }
                    placeholder="e.g. Shop Now"
                    className="input input-bordered input-sm w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label font-bold text-base-content">
                    Button Destination Link
                  </label>
                  <input
                    type="text"
                    value={editingSection.buttonLink || ""}
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        buttonLink: e.target.value,
                      })
                    }
                    placeholder="e.g. /shop"
                    className="input input-bordered input-sm w-full"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label font-bold text-base-content">
                  Banner Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={editingSection.imageUrl || ""}
                  onChange={(e) =>
                    setEditingSection({
                      ...editingSection,
                      imageUrl: e.target.value,
                    })
                  }
                  placeholder="https://images.unsplash.com/... or /asset.jpg"
                  className="input input-bordered input-sm w-full"
                />
              </div>

              {/* Special options for Products section */}
              {editingSection.subtitle?.toLowerCase().includes("product") && (
                <div className="form-control bg-base-200/50 p-3 rounded-xl">
                  <label className="label font-bold text-base-content">
                    Number of Products to Display
                  </label>
                  <select
                    className="select select-bordered select-sm w-full font-semibold"
                    value={(editingSection.content as any)?.limit || 8}
                    onChange={(e) => {
                      const limit = Number(e.target.value);
                      const prevContent = (editingSection.content as any) || {};
                      setEditingSection({
                        ...editingSection,
                        content: { ...prevContent, limit },
                      });
                    }}
                  >
                    <option value="4">4 Products (1 Row)</option>
                    <option value="8">8 Products (2 Rows)</option>
                    <option value="12">12 Products (3 Rows)</option>
                    <option value="16">16 Products (4 Rows)</option>
                  </select>
                </div>
              )}

              <div className="modal-action border-t border-base-200 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="btn btn-sm btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSection}
                  className="btn btn-sm btn-primary font-bold px-6"
                >
                  {savingSection ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <Save size={14} />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: ADD NEW CUSTOM PROMOTIONAL SECTION ─────────────── */}
      {isAddModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box w-full max-w-xl bg-base-100 p-6 rounded-3xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-base-200 pb-3">
              <div>
                <h3 className="font-bold text-lg text-base-content flex items-center gap-2">
                  <Plus size={18} className="text-primary" />
                  <span>Add Custom Promotional Section</span>
                </h3>
                <p className="text-xs text-base-content/60">
                  Add a new banner or marketing section to the homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomSection} className="space-y-4 text-xs">
              <div className="form-control">
                <label className="label font-bold text-base-content">
                  Section Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder='e.g. "Exclusive Winter Sale - Up to 50% Off"'
                  value={newSection.title}
                  onChange={(e) =>
                    setNewSection({ ...newSection, title: e.target.value })
                  }
                  className="input input-bordered input-sm w-full font-bold"
                />
              </div>

              <div className="form-control">
                <label className="label font-bold text-base-content">
                  Badge / Tagline
                </label>
                <input
                  type="text"
                  placeholder='e.g. "Limited Time Offer"'
                  value={newSection.subtitle}
                  onChange={(e) =>
                    setNewSection({ ...newSection, subtitle: e.target.value })
                  }
                  className="input input-bordered input-sm w-full"
                />
              </div>

              <div className="form-control">
                <label className="label font-bold text-base-content">
                  Description / Offer Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your special offer or announcement..."
                  value={newSection.description}
                  onChange={(e) =>
                    setNewSection({
                      ...newSection,
                      description: e.target.value,
                    })
                  }
                  className="textarea textarea-bordered w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label font-bold text-base-content">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={newSection.buttonText}
                    onChange={(e) =>
                      setNewSection({
                        ...newSection,
                        buttonText: e.target.value,
                      })
                    }
                    placeholder="e.g. Shop Collection"
                    className="input input-bordered input-sm w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label font-bold text-base-content">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={newSection.buttonLink}
                    onChange={(e) =>
                      setNewSection({
                        ...newSection,
                        buttonLink: e.target.value,
                      })
                    }
                    placeholder="e.g. /shop"
                    className="input input-bordered input-sm w-full"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label font-bold text-base-content">
                  Background Banner Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={newSection.imageUrl}
                  onChange={(e) =>
                    setNewSection({ ...newSection, imageUrl: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/... or /banner.jpg"
                  className="input input-bordered input-sm w-full"
                />
              </div>

              <div className="modal-action border-t border-base-200 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-sm btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary font-bold px-6"
                >
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
