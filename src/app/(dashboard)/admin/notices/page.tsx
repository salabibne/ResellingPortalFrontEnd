"use client";

import React, { useEffect, useState } from "react";
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Users,
  Globe,
  Calendar,
  X,
  AlertCircle,
} from "lucide-react";
import noticeApi, {
  NoticeAudience,
  NoticeModal,
  SaveNoticeModalDto,
} from "@/services/notice.api";
import PanelPage from "@/components/panel/PanelPage";
import PanelPageHeader from "@/components/panel/PanelPageHeader";
import PanelTabs from "@/components/panel/PanelTabs";
import PanelEmpty from "@/components/panel/PanelEmpty";
import PanelSkeleton from "@/components/panel/PanelSkeleton";
import PanelModal from "@/components/panel/PanelModal";

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<NoticeModal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAudience, setFilterAudience] = useState<string>("ALL_FILTER");

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeModal | null>(null);
  const [previewNotice, setPreviewNotice] = useState<NoticeModal | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [targetAudience, setTargetAudience] = useState<NoticeAudience>("ALL");
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await noticeApi.getAll();
      setNotices(data);
    } catch (err: any) {
      console.error("Failed to load notices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const openCreateModal = () => {
    setEditingNotice(null);
    setTitle("");
    setContent("");
    setImageUrl("");
    setButtonText("");
    setButtonLink("");
    setTargetAudience("ALL");
    setIsActive(true);
    setStartDate("");
    setEndDate("");
    setFormError("");
    setIsFormOpen(true);
  };

  const openEditModal = (item: NoticeModal) => {
    setEditingNotice(item);
    setTitle(item.title);
    setContent(item.content);
    setImageUrl(item.imageUrl || "");
    setButtonText(item.buttonText || "");
    setButtonLink(item.buttonLink || "");
    setTargetAudience(item.targetAudience);
    setIsActive(item.status === "ACTIVE");
    setStartDate(item.startDate ? item.startDate.slice(0, 10) : "");
    setEndDate(item.endDate ? item.endDate.slice(0, 10) : "");
    setFormError("");
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFormError("Title and Message Content are required.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const payload: SaveNoticeModalDto = {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
        buttonText: buttonText.trim() || undefined,
        buttonLink: buttonLink.trim() || undefined,
        targetAudience,
        status: isActive ? "ACTIVE" : "DEACTIVATED",
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      };

      if (editingNotice) {
        await noticeApi.update(editingNotice.id, payload);
      } else {
        await noticeApi.create(payload);
      }

      setIsFormOpen(false);
      await fetchNotices();
    } catch (err: any) {
      console.error("Save notice failed:", err);
      setFormError(err.response?.data?.message || "Failed to save notice modal.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: NoticeModal) => {
    try {
      await noticeApi.toggleStatus(item.id);
      await fetchNotices();
    } catch (err: any) {
      alert("Failed to toggle status: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (item: NoticeModal) => {
    if (!window.confirm(`Are you sure you want to delete notice "${item.title}"?`)) {
      return;
    }
    try {
      await noticeApi.delete(item.id);
      await fetchNotices();
    } catch (err: any) {
      alert("Failed to delete notice: " + (err.response?.data?.message || err.message));
    }
  };

  const filteredNotices = notices.filter((n) => {
    if (filterAudience === "ALL_FILTER") return true;
    if (filterAudience === "ACTIVE_ONLY") return n.status === "ACTIVE";
    return n.targetAudience === filterAudience || n.targetAudience === "ALL";
  });

  const getAudienceBadge = (aud: NoticeAudience) => {
    switch (aud) {
      case "ALL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
            <Layers size={12} /> Both (Public & Reseller)
          </span>
        );
      case "RESELLER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <Users size={12} /> Reseller Panel Only
          </span>
        );
      case "PUBLIC":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
            <Globe size={12} /> Normal Store Only
          </span>
        );
    }
  };

  return (
    <PanelPage>
      <PanelPageHeader
        title="Pop-up Notices"
        subtitle="Configure announcement pop-up modals for visitors and resellers. Decide who sees each notice based on business needs."
        icon={Bell}
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="btn btn-primary btn-sm rounded-xl gap-2 text-white"
          >
            <Plus size={16} /> Create New Notice
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-base-100 border border-base-200 p-4 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase">Total Notices</p>
          <p className="text-2xl font-black text-base-content mt-1">{notices.length}</p>
        </div>
        <div className="bg-base-100 border border-base-200 p-4 rounded-2xl shadow-sm">
          <p className="text-xs text-emerald-600 font-semibold uppercase">Active Notices</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {notices.filter((n) => n.status === "ACTIVE").length}
          </p>
        </div>
        <div className="bg-base-100 border border-base-200 p-4 rounded-2xl shadow-sm">
          <p className="text-xs text-purple-600 font-semibold uppercase">Reseller Targeted</p>
          <p className="text-2xl font-black text-purple-600 mt-1">
            {notices.filter((n) => n.targetAudience === "RESELLER" || n.targetAudience === "ALL").length}
          </p>
        </div>
        <div className="bg-base-100 border border-base-200 p-4 rounded-2xl shadow-sm">
          <p className="text-xs text-blue-600 font-semibold uppercase">Public Targeted</p>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {notices.filter((n) => n.targetAudience === "PUBLIC" || n.targetAudience === "ALL").length}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <PanelTabs
        ariaLabel="Filter notices"
        value={filterAudience}
        onChange={setFilterAudience}
        tabs={[
          { id: "ALL_FILTER", label: "All Notices" },
          { id: "ACTIVE_ONLY", label: "Active Only" },
          { id: "PUBLIC", label: "Normal Store" },
          { id: "RESELLER", label: "Reseller Panel" },
        ]}
      />

      {/* Notices List */}
      {loading ? (
        <PanelSkeleton variant="cards" rows={6} />
      ) : filteredNotices.length === 0 ? (
        <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm">
          <PanelEmpty
            icon={Bell}
            title="No pop-up notices found"
            text="Click the button below to create your first announcement pop-up for your visitors or resellers."
            action={
              <button
                type="button"
                onClick={openCreateModal}
                className="btn btn-primary btn-sm rounded-xl gap-2 text-white"
              >
                <Plus size={16} /> Create Notice
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotices.map((item) => (
            <div
              key={item.id}
              className={`bg-base-100 border transition-colors rounded-2xl overflow-hidden shadow-sm hover:shadow-md flex flex-col justify-between ${
                item.status === "ACTIVE"
                  ? "border-emerald-200 ring-1 ring-emerald-500/10"
                  : "border-slate-200 opacity-80"
              }`}
            >
              <div>
                {/* Banner Thumbnail (if any) */}
                {item.imageUrl && (
                  <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="p-5 space-y-3">
                  {/* Top Target & Status */}
                  <div className="flex items-center justify-between gap-2">
                    {getAudienceBadge(item.targetAudience)}
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className={`badge font-bold text-[11px] gap-1 cursor-pointer transition ${
                        item.status === "ACTIVE"
                          ? "badge-success text-white"
                          : "badge-ghost text-slate-400"
                      }`}
                      title="Click to toggle status"
                    >
                      {item.status === "ACTIVE" ? (
                        <>
                          <CheckCircle size={10} /> Active
                        </>
                      ) : (
                        <>
                          <XCircle size={10} /> Inactive
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-base-content text-lg leading-tight line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Snippet */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-line">
                    {item.content}
                  </p>

                  {/* Action Link Details */}
                  {item.buttonText && item.buttonLink && (
                    <div className="text-[11px] text-primary flex items-center gap-1 font-semibold">
                      <ExternalLink size={12} />
                      <span>{item.buttonText} &rarr; {item.buttonLink}</span>
                    </div>
                  )}

                  {/* Dates */}
                  {(item.startDate || item.endDate) && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
                      <Calendar size={12} />
                      <span>
                        {item.startDate ? item.startDate.slice(0, 10) : "Now"} &rarr;{" "}
                        {item.endDate ? item.endDate.slice(0, 10) : "Indefinite"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPreviewNotice(item)}
                  className="btn btn-ghost btn-xs text-slate-700 hover:bg-slate-200 gap-1"
                  title="Preview pop-up modal"
                >
                  <Eye size={14} /> Preview
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 gap-1"
                    title="Edit notice"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="btn btn-ghost btn-xs text-error hover:bg-error/10 gap-1"
                    title="Delete notice"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT FORM DIALOG */}
      {isFormOpen && (
        <PanelModal
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingNotice ? "Edit Pop-up Notice" : "Create New Pop-up Notice"}
          size="lg"
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="btn btn-ghost btn-sm rounded-xl"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="notice-form"
                className="btn btn-primary btn-sm rounded-xl gap-2 text-white"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : editingNotice ? (
                  "Update Notice"
                ) : (
                  "Publish Notice"
                )}
              </button>
            </>
          }
        >
            <form id="notice-form" onSubmit={handleSave} className="space-y-4">
              {formError && (
                <div className="alert alert-error text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-slate-800">Notice Title *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Special Wholesale Offer or Delivery Alert"
                  className="input input-bordered w-full input-sm text-base-content"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Content */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-slate-800">Notice Message / Body *</span>
                </label>
                <textarea
                  placeholder="Enter detailed notice message to show visitors..."
                  rows={4}
                  className="textarea textarea-bordered w-full text-sm text-base-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              {/* Target Audience */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-slate-800">
                    Who should see this modal? (Target Audience) *
                  </span>
                </label>
                <select
                  className="select select-bordered select-sm w-full text-base-content font-semibold"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as NoticeAudience)}
                >
                  <option value="ALL">Both Reseller Panel & Normal Customer Website</option>
                  <option value="PUBLIC">Normal Customer Website Only</option>
                  <option value="RESELLER">Reseller Panel Only</option>
                </select>
                <span className="label-text-alt text-slate-400 mt-1">
                  Admin decides whether normal visitors, resellers, or both will see this modal.
                </span>
              </div>

              {/* Optional Banner Image URL */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-slate-700">
                    Banner Image URL (Optional)
                  </span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/images/banner.jpg"
                  className="input input-bordered w-full input-sm text-base-content"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              {/* Action Button Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-slate-700">
                      Button Text (Optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Order Now / View Catalog"
                    className="input input-bordered w-full input-sm text-base-content"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-slate-700">
                      Button Link (Optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /shop or https://..."
                    className="input input-bordered w-full input-sm text-base-content"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                  />
                </div>
              </div>

              {/* Start & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-slate-700">
                      Start Date (Optional)
                    </span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full input-sm text-base-content"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-slate-700">
                      Expiration Date (Optional)
                    </span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full input-sm text-base-content"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="form-control pt-2">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary toggle-sm"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span className="label-text font-bold text-slate-800">
                    Active (Show modal immediately if within date range)
                  </span>
                </label>
              </div>

            </form>
        </PanelModal>
      )}

      {/* LIVE PREVIEW MODAL */}
      {previewNotice && (
        <PanelModal
          open={!!previewNotice}
          onClose={() => setPreviewNotice(null)}
          title="Notice Preview"
          size="md"
          footer={
            <button
              type="button"
              onClick={() => setPreviewNotice(null)}
              className="btn btn-primary btn-sm rounded-xl"
            >
              Close Preview
            </button>
          }
        >
          <div className="space-y-4">
            {previewNotice.imageUrl && (
              <div className="relative w-full h-48 bg-base-200 overflow-hidden rounded-xl">
                <img
                  src={previewNotice.imageUrl}
                  alt={previewNotice.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-primary/10 text-primary border border-primary/20">
                <Bell size={13} />
                Live Preview
              </span>
              {getAudienceBadge(previewNotice.targetAudience)}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-base-content leading-snug">
              {previewNotice.title}
            </h2>

            <p className="text-sm text-base-content/70 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-line">
              {previewNotice.content}
            </p>

            {previewNotice.buttonText && (
              <button type="button" className="btn btn-primary btn-sm rounded-xl w-full gap-2 text-white">
                <span>{previewNotice.buttonText}</span>
                <ExternalLink size={16} />
              </button>
            )}
          </div>
        </PanelModal>
      )}
    </PanelPage>
  );
}
