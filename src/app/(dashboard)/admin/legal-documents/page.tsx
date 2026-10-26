"use client";

import PanelPageHeader from "@/components/panel/PanelPageHeader";
import PanelModal from "@/components/panel/PanelModal";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Lock,
  CheckCircle,
  Clock,
  Archive,
  Eye,
  X,
  History,
} from "lucide-react";
import legalDocumentsApi, {
  LegalDocument,
  LegalDocumentStatus,
  SaveLegalDocumentDto,
} from "@/services/legalDocuments.api";
import RichTextEditor from "@/components/ui/RichTextEditor";

export default function AdminLegalDocumentsPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Editor Drawer Modal State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingDoc, setEditingDoc] = useState<Partial<SaveLegalDocumentDto> & { id?: string; isSystem?: boolean } | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await legalDocumentsApi.getAll();
      setDocuments(data);
    } catch (err) {
      console.error("Failed to fetch legal documents", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingDoc({
      title: "",
      slug: "",
      content: "",
      version: "1.0",
      isSystem: false,
      status: "DRAFT",
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (doc: LegalDocument) => {
    setEditingDoc(doc);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (doc: LegalDocument) => {
    if (doc.isSystem) {
      alert("System protected legal documents cannot be deleted!");
      return;
    }
    if (!confirm(`Are you sure you want to delete "${doc.title}"?`)) return;
    try {
      await legalDocumentsApi.delete(doc.id);
      fetchDocuments();
    } catch (err) {
      console.error("Failed to delete legal document", err);
      alert("Failed to delete document.");
    }
  };

  const handleTitleChange = (title: string) => {
    const generatedSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-");
    setEditingDoc((prev) => ({
      ...prev,
      title,
      slug: prev?.isSystem ? prev.slug : generatedSlug,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc?.title || !editingDoc?.slug || !editingDoc?.version) {
      alert("Title, Slug, and Version are required.");
      return;
    }

    setSaving(true);
    try {
      if (editingDoc.id) {
        await legalDocumentsApi.update(editingDoc.id, editingDoc);
      } else {
        await legalDocumentsApi.create(editingDoc as any);
      }
      setIsDrawerOpen(false);
      fetchDocuments();
    } catch (err) {
      console.error("Failed to save legal document", err);
      alert("Failed to save legal document.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-base-100 text-base-content">
      <PanelPageHeader
        title="Legal Documents Manager"
        subtitle="Create, version control, and publish legal agreements (Terms & Conditions, Privacy Policy, Return & Refund Policy, Reseller Agreement)."
        icon={FileText}
        actions={
          <button
            type="button"
            onClick={handleOpenCreate}
            className="btn btn-primary btn-sm rounded-xl gap-2 text-white"
          >
            <Plus size={16} /> Create Legal Document
          </button>
        }
      />

      {/* Document List Table */}
      <div className="bg-base-100 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading legal documents...</div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No legal documents found. Click &ldquo;+ Create Legal Document&rdquo; to add compliance documents.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th>Document Title</th>
                  <th>Slug</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>System Tag</th>
                  <th>Last Updated</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="font-semibold text-base-content flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      {doc.title}
                    </td>
                    <td className="text-xs font-mono text-gray-500">/legal/{doc.slug}</td>
                    <td>
                      <span className="badge badge-outline text-xs font-mono gap-1">
                        <History className="w-3 h-3 text-gray-400" /> v{doc.version}
                      </span>
                    </td>
                    <td>
                      {doc.status === "PUBLISHED" && (
                        <span className="badge badge-success gap-1 text-white text-xs">
                          <CheckCircle className="w-3 h-3" /> Published
                        </span>
                      )}
                      {doc.status === "DRAFT" && (
                        <span className="badge badge-warning gap-1 text-xs">
                          <Clock className="w-3 h-3" /> Draft
                        </span>
                      )}
                      {doc.status === "ARCHIVED" && (
                        <span className="badge badge-ghost gap-1 text-xs">
                          <Archive className="w-3 h-3" /> Archived
                        </span>
                      )}
                    </td>
                    <td>
                      {doc.isSystem ? (
                        <span className="badge badge-primary text-xs flex items-center gap-1">
                          <Lock className="w-3 h-3" /> System Locked
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Custom Legal</span>
                      )}
                    </td>
                    <td className="text-xs text-gray-500">
                      {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="text-right space-x-1">
                      <a
                        href={`/legal/${doc.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-ghost btn-xs text-info"
                        title="View Public Document"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleOpenEdit(doc)}
                        className="btn btn-ghost btn-xs text-primary"
                        title="Edit Document"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc)}
                        disabled={doc.isSystem}
                        className="btn btn-ghost btn-xs text-error"
                        title={
                          doc.isSystem
                            ? "System documents cannot be deleted"
                            : "Delete Legal Document"
                        }
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

      {/* Editor Modal */}
      {isDrawerOpen && editingDoc && (
        <PanelModal
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={editingDoc.id ? "Edit Legal Document" : "Create Legal Document"}
          size="lg"
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="btn btn-ghost btn-sm rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="legal-doc-form"
                disabled={saving}
                className="btn btn-primary btn-sm rounded-xl gap-2 text-white"
              >
                {saving ? "Saving Document..." : "Save Legal Document"}
              </button>
            </>
          }
        >
          <form id="legal-doc-form" onSubmit={handleSave} className="space-y-6">
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-sm text-base-content">
                  Document Settings & Versioning
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text text-xs font-semibold text-base-content">Document Title *</label>
                    <input
                      type="text"
                      value={editingDoc.title || ""}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. Return & Refund Policy"
                      className="input input-bordered w-full text-sm mt-1 bg-base-100 text-base-content"
                      required
                    />
                  </div>
                  <div>
                    <label className="label-text text-xs font-semibold text-base-content flex items-center justify-between">
                      <span>URL Slug *</span>
                      {editingDoc.isSystem && (
                        <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                          <Lock className="w-3 h-3" /> System Locked
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editingDoc.slug || ""}
                      onChange={(e) =>
                        setEditingDoc((prev) => ({ ...prev, slug: e.target.value }))
                      }
                      placeholder="return-refund-policy"
                      disabled={editingDoc.isSystem}
                      className="input input-bordered w-full text-sm mt-1 font-mono bg-base-100 text-base-content"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text text-xs font-semibold text-base-content">Document Version *</label>
                    <input
                      type="text"
                      value={editingDoc.version || "1.0"}
                      onChange={(e) =>
                        setEditingDoc((prev) => ({ ...prev, version: e.target.value }))
                      }
                      placeholder="e.g. 1.0 or 1.2"
                      className="input input-bordered w-full text-sm mt-1 font-mono bg-base-100 text-base-content"
                      required
                    />
                  </div>
                  <div>
                    <label className="label-text text-xs font-semibold text-base-content">Publication Status</label>
                    <select
                      value={editingDoc.status || "DRAFT"}
                      onChange={(e) =>
                        setEditingDoc((prev) => ({
                          ...prev,
                          status: e.target.value as LegalDocumentStatus,
                        }))
                      }
                      className="select select-bordered w-full text-sm mt-1 bg-base-100 text-base-content"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Rich Text Editor */}
              <div className="space-y-2">
                <label className="label-text text-xs font-semibold text-base-content">
                  Document Content (WYSIWYG & HTML)
                </label>
                <RichTextEditor
                  value={editingDoc.content || ""}
                  onChange={(val) => setEditingDoc((prev) => ({ ...prev, content: val }))}
                  placeholder="Enter full terms, privacy rules, or refund eligibility details..."
                  minHeight="350px"
                />
              </div>

            </form>
        </PanelModal>
      )}
    </div>
  );
}
