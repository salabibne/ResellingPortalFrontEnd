"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, X, Loader2, AlertCircle, CheckCircle, ExternalLink, RefreshCw } from "lucide-react";
import cmsApi, { CMSModuleType, CommonStatus } from "@/services/cms.api";
import PanelCard from "@/components/panel/PanelCard";
import PanelModal from "@/components/panel/PanelModal";

export type FieldFieldType = "text" | "textarea" | "email" | "url" | "select";

export interface CMSFieldConfig {
  name: string;
  label: string;
  type: FieldFieldType;
  required?: boolean;
  placeholder?: string;
}

export interface CMSModuleConfig {
  module: CMSModuleType;
  title: string;
  description: string;
  fields: CMSFieldConfig[];
}

export const MODULE_CONFIGS: Record<CMSModuleType, CMSModuleConfig> = {
  "social-media": {
    module: "social-media",
    title: "Social Media Links",
    description: "Manage social media platform links and icons displayed across the site.",
    fields: [
      { name: "name", label: "Platform Name", type: "text", required: true, placeholder: 'e.g. "Facebook Page"' },
      { name: "iconName", label: "Icon Identifier", type: "text", required: true, placeholder: 'e.g. "fa-facebook" or "facebook"' },
    ],
  },
  contact: {
    module: "contact",
    title: "Contact Information & WhatsApp Live Chat",
    description: "Manage public phone numbers, emails, office address, and bottom-right floating WhatsApp button number/link.",
    fields: [
      { name: "whatsapp", label: "WhatsApp Floating Button (Mobile Number, Username, or Link)", type: "text", required: false, placeholder: 'e.g. "01577276367", "+8801577276367", or "wa.me/..."' },
      { name: "phone", label: "Customer Service Phone Number", type: "text", required: true, placeholder: 'e.g. "+8801700000000"' },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: 'e.g. "support@aarhamapparel.com"' },
      { name: "address", label: "Physical Address", type: "textarea", required: true, placeholder: "Full office or store address..." },
      { name: "telegram", label: "Telegram Link / Handle", type: "text", required: false, placeholder: 'e.g. "https://t.me/aarham"' },
      { name: "facebook", label: "Facebook Page URL", type: "url", required: false, placeholder: "https://facebook.com/aarhamapparel" },
    ],
  },
  brand: {
    module: "brand",
    title: "Site Logo",
    description: "Set the brand logo shown in the public site header and footer. Paste an image URL (absolute or site-relative).",
    fields: [
      { name: "logoUrl", label: "Logo Image URL", type: "url", required: true, placeholder: "https://cdn.aarhamapparel.com/logo.png or /images/logo.png" },
    ],
  },
  hero: {
    module: "hero",
    title: "Hero Banner",
    description: "Manage main homepage hero banner content, titles, background images, and CTAs.",
    fields: [
      { name: "heroTitle", label: "Hero Banner Title", type: "text", required: true, placeholder: "e.g. Style Meets Substance" },
      { name: "heroSubtitle", label: "Hero Subtitle / Description", type: "textarea", required: true, placeholder: "Brief hero introductory paragraph..." },
      { name: "buttonText1", label: "Primary Button Text", type: "text", required: true, placeholder: 'e.g. "Shop Collection"' },
      { name: "buttonLink1", label: "Primary Button Link", type: "text", required: true, placeholder: 'e.g. "/shop"' },
      { name: "buttonText2", label: "Secondary Button Text", type: "text", required: false, placeholder: 'e.g. "Explore Categories"' },
      { name: "buttonLink2", label: "Secondary Button Link", type: "text", required: false, placeholder: 'e.g. "/about"' },
      { name: "imageUrl", label: "Image / Banner Asset URL", type: "url", required: true, placeholder: "https://images.unsplash.com/... or /api/image?name=hero" },
    ],
  },
  about: {
    module: "about",
    title: "About Section",
    description: "Manage introductory company story, mission details, and featured introductory video.",
    fields: [
      { name: "title", label: "About Section Title", type: "text", required: true, placeholder: 'e.g. "About Aarham Apparel"' },
      { name: "description", label: "Detailed Description", type: "textarea", required: true, placeholder: "Detailed overview of the brand..." },
      { name: "youtubeLink", label: "YouTube Video URL", type: "url", required: true, placeholder: "https://www.youtube.com/watch?v=..." },
      { name: "buttonText1", label: "Primary Button Text", type: "text", required: true, placeholder: 'e.g. "Read Full Story"' },
      { name: "buttonLink1", label: "Primary Button Link", type: "text", required: true, placeholder: 'e.g. "/about"' },
      { name: "buttonText2", label: "Secondary Button Text", type: "text", required: false, placeholder: 'e.g. "Contact Us"' },
      { name: "buttonLink2", label: "Secondary Button Link", type: "text", required: false, placeholder: 'e.g. "#contact"' },
    ],
  },
  section: {
    module: "section",
    title: "Feature Sections & Cards",
    description: "Manage feature grids, highlight cards, icons, and call-to-action cards.",
    fields: [
      { name: "title", label: "Section Title / Heading", type: "text", required: true, placeholder: 'e.g. "Why Choose Us"' },
      { name: "description", label: "Section Description / Overview", type: "textarea", required: true, placeholder: "Summary text for this feature group..." },
      { name: "imageUrl", label: "Banner / Card Image URL (Optional)", type: "url", required: false, placeholder: "https://images.unsplash.com/..." },
      { name: "cardTitle", label: "Card Title", type: "text", required: true, placeholder: 'e.g. "Premium Fabric"' },
      { name: "cardIcon", label: "Card Icon Name", type: "text", required: true, placeholder: 'e.g. "ShieldCheck", "Truck", "Sparkles"' },
      { name: "cardDescription", label: "Card Body Description", type: "textarea", required: true, placeholder: "Specific card text..." },
      { name: "cardButton", label: "Card Button Text", type: "text", required: false, placeholder: 'e.g. "Learn More"' },
      { name: "cardLink", label: "Card Destination Link", type: "text", required: false, placeholder: 'e.g. "/shop"' },
    ],
  },
  founder: {
    module: "founder",
    title: "Founder Profile",
    description: "Manage founder profile photo, title, and visionary statement.",
    fields: [
      { name: "title", label: "Heading / Title", type: "text", required: true, placeholder: 'e.g. "Founder\'s Vision"' },
      { name: "description", label: "Full Message / Quote", type: "textarea", required: true, placeholder: "Message from the founder..." },
      { name: "imageUrl", label: "Founder Profile Picture URL", type: "url", required: true, placeholder: "https://..." },
    ],
  },
  "founder-blog": {
    module: "founder-blog",
    title: "Founder Blogs",
    description: "Manage blog posts, articles, and founder updates.",
    fields: [
      { name: "title", label: "Article Title", type: "text", required: true, placeholder: 'e.g. "Building Sustainable Fashion"' },
      { name: "imageUrl", label: "Cover Image URL", type: "url", required: true, placeholder: "https://..." },
      { name: "description", label: "Blog Content / Excerpt", type: "textarea", required: true, placeholder: "Article body content..." },
    ],
  },
  "founder-video": {
    module: "founder-video",
    title: "Founder Videos",
    description: "Manage founder video showcases, video titles, and links.",
    fields: [
      { name: "title", label: "Video Title", type: "text", required: true, placeholder: 'e.g. "Keynote Presentation 2024"' },
      { name: "videoLink", label: "Video Streaming / YouTube URL", type: "url", required: true, placeholder: "https://www.youtube.com/watch?v=..." },
      { name: "description", label: "Summary Description", type: "textarea", required: true, placeholder: "Video highlights and summary..." },
    ],
  },
  team: {
    module: "team",
    title: "Our Team",
    description: "Manage team member profiles, designations, photos, and messages displayed on the homepage.",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: 'e.g. "Sarah Jenkins"' },
      { name: "designation", label: "Designation / Role", type: "text", required: true, placeholder: 'e.g. "Head of Design"' },
      { name: "imageUrl", label: "Profile Picture URL", type: "url", required: true, placeholder: "https://images.unsplash.com/... or profile image link" },
      { name: "message", label: "Personal Message / Statement", type: "textarea", required: true, placeholder: "Brief bio, message, or quote from the team member..." },
    ],
  },
};

type Props = {
  module: CMSModuleType;
  /** Called after any successful create/update/toggle/delete so parent views
   *  (e.g. the configured WhatsApp number shown on /cms) stay in sync. */
  onSaved?: () => void | Promise<void>;
};

export default function CmsManager({ module, onSaved }: Props) {
  const config = MODULE_CONFIGS[module];
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  // Feedback states
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      setFeedback(null);
      const data = await cmsApi.getAll(module);
      setRecords(data);
    } catch (err: any) {
      console.error(`Failed to fetch ${config.title}:`, err);
      setFeedback({
        type: "error",
        message: err?.response?.data?.message || `Failed to fetch ${config.title} records.`,
      });
    } finally {
      setIsLoading(false);
    }
  }, [module, config.title]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleOpenForm = (record: any | null = null, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentRecord(record);
    if (record) {
      const initialForm: Record<string, any> = { status: record.status || "ACTIVE" };
      config.fields.forEach((f) => {
        initialForm[f.name] = record[f.name] ?? "";
      });
      setFormData(initialForm);
    } else {
      const initialForm: Record<string, any> = { status: "ACTIVE" };
      config.fields.forEach((f) => {
        initialForm[f.name] = "";
      });
      setFormData(initialForm);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentRecord(null);
    setFormData({});
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    // Prepare payload cleanly according to config fields + status
    const payload: Record<string, any> = {
      status: formData.status || "ACTIVE",
    };

    config.fields.forEach((f) => {
      payload[f.name] = formData[f.name] ?? "";
    });

    try {
      if (currentRecord?.id) {
        await cmsApi.update(module, currentRecord.id, payload);
        setFeedback({ type: "success", message: `${config.title} item updated successfully!` });
      } else {
        await cmsApi.create(module, payload);
        setFeedback({ type: "success", message: `New ${config.title} item created successfully!` });
      }
      handleCloseForm();
      await fetchRecords();
      await onSaved?.();
    } catch (err: any) {
      console.error("Save failed:", err);
      setFeedback({
        type: "error",
        message: err?.response?.data?.message || "Failed to save entry. Check permissions and inputs.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (record: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus: CommonStatus = record.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE";
    try {
      await cmsApi.toggleStatus(module, record.id, newStatus);
      setFeedback({ type: "success", message: `Status updated to ${newStatus}` });
      await fetchRecords();
      await onSaved?.();
    } catch (err: any) {
      console.error("Status update failed:", err);
      setFeedback({
        type: "error",
        message: err?.response?.data?.message || "Failed to change status.",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      setIsSubmitting(true);
      await cmsApi.delete(module, deleteTargetId);
      setFeedback({ type: "success", message: "Item deleted successfully!" });
      setDeleteTargetId(null);
      await fetchRecords();
      await onSaved?.();
    } catch (err: any) {
      console.error("Delete failed:", err);
      setFeedback({
        type: "error",
        message: err?.response?.data?.message || "Failed to delete item.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header Bar */}
      <PanelCard>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-base-content">{config.title}</h2>
            <p className="text-sm text-base-content/60 mt-1">{config.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchRecords}
              className="btn btn-ghost btn-sm rounded-xl gap-2"
              title="Refresh Data"
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              onClick={(e) => handleOpenForm(null, e)}
              className="btn btn-primary btn-sm rounded-xl gap-2 text-white"
              disabled={isLoading}
            >
              <Plus size={16} /> Add Entry
            </button>
          </div>
        </div>
      </PanelCard>

      {/* Feedback Alerts */}
      {feedback && (
        <div
          className={`alert ${
            feedback.type === "success" ? "alert-success text-white" : "alert-error text-white"
          } shadow-md flex justify-between items-center`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{feedback.message}</span>
          </div>
          <button className="btn btn-ghost btn-xs text-white" onClick={() => setFeedback(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-base-100 rounded-2xl shadow-md border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-200 text-base-content font-bold">
                <th className="w-12">#</th>
                {config.fields.map((f) => (
                  <th key={f.name} className="whitespace-nowrap">{f.label}</th>
                ))}
                <th className="text-center whitespace-nowrap">Status</th>
                <th className="text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={config.fields.length + 3} className="text-center py-12">
                    <Loader2 className="animate-spin mx-auto text-primary" size={28} />
                    <p className="mt-2 text-sm text-base-content/60">Loading {config.title}...</p>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={config.fields.length + 3}
                    className="text-center py-12 text-base-content/60"
                  >
                    No content entries found for {config.title}. Click &ldquo;Add Entry&rdquo; to create one.
                  </td>
                </tr>
              ) : (
                records.map((record, index) => (
                  <tr key={record.id || index} className="hover:bg-base-200/50 transition-colors border-b">
                    <td className="font-semibold text-base-content/70">{index + 1}</td>
                    {config.fields.map((f) => {
                      const val = record[f.name];
                      const isUrl = f.type === "url" || (typeof val === "string" && val.startsWith("http"));
                      return (
                        <td key={f.name} className="max-w-[200px] truncate">
                          {isUrl && val ? (
                            <a
                              href={val}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 inline-flex max-w-full truncate"
                            >
                              <span className="truncate">{val}</span>
                              <ExternalLink size={14} className="shrink-0" />
                            </a>
                          ) : (
                            val || <span className="text-base-content/40 italic">-</span>
                          )}
                        </td>
                      );
                    })}
                    {/* Status Badge & Toggle */}
                    <td className="text-center">
                      <button
                        onClick={(e) => handleToggleStatus(record, e)}
                        className={`btn btn-xs rounded-full font-semibold transition-all ${
                          record.status === "ACTIVE"
                            ? "btn-success text-white"
                            : record.status === "PENDING"
                            ? "btn-warning text-white"
                            : "btn-error text-white"
                        }`}
                        title="Click to toggle Status"
                      >
                        {record.status || "ACTIVE"}
                      </button>
                    </td>

                    {/* Action Controls */}
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="btn btn-ghost btn-sm text-primary"
                          onClick={(e) => handleOpenForm(record, e)}
                          title="Edit Entry"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm text-error"
                          onClick={() => setDeleteTargetId(record.id)}
                          title="Delete Entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation / Edit Form Modal */}
      {isFormOpen && (
        <PanelModal
          open={isFormOpen}
          onClose={handleCloseForm}
          title={currentRecord ? `Edit ${config.title}` : `Create ${config.title}`}
          size="lg"
          footer={
            <>
              <button
                type="button"
                className="btn btn-ghost btn-sm rounded-xl"
                onClick={handleCloseForm}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="cms-entry-form"
                className="btn btn-primary btn-sm rounded-xl gap-2 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : currentRecord ? (
                  "Update Entry"
                ) : (
                  "Create Entry"
                )}
              </button>
            </>
          }
        >
          <form id="cms-entry-form" onSubmit={handleSave} className="flex flex-col gap-4">
            <p className="text-xs text-base-content/60 -mt-1">
              Fill out the required fields below. Click save to publish changes.
            </p>
            {config.fields.map((field) => (
              <div className="form-control w-full" key={field.name}>
                <label className="label py-1">
                  <span className="label-text font-semibold text-base-content">
                    {field.label} {field.required && <span className="text-error">*</span>}
                  </span>
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    className="textarea textarea-bordered w-full"
                    rows={3}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                  />
                ) : (
                  <input
                    type={field.type === "url" ? "text" : field.type}
                    className="input input-bordered w-full"
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                  />
                )}
              </div>
            ))}

            {/* Status Select */}
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text font-semibold text-base-content">Status</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.status || "ACTIVE"}
                onChange={(e) => handleInputChange("status", e.target.value)}
                required
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="DEACTIVATED">DEACTIVATED</option>
              </select>
            </div>
          </form>
        </PanelModal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <PanelModal
          open={!!deleteTargetId}
          onClose={() => setDeleteTargetId(null)}
          title="Confirm Deletion"
          size="sm"
          footer={
            <>
              <button
                type="button"
                className="btn btn-ghost btn-sm rounded-xl"
                onClick={() => setDeleteTargetId(null)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-error btn-sm rounded-xl gap-2 text-white"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Delete"}
              </button>
            </>
          }
        >
          <p className="text-sm text-base-content/70">
            Are you sure you want to delete this {config.title} entry? This action cannot be undone.
          </p>
        </PanelModal>
      )}
    </div>
  );
}
