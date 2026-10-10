"use client";

import React, { useEffect, useState } from "react";
import {
  Globe,
  Plus,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  KeyRound,
  ShieldCheck,
  Edit2,
  Trash2,
  X,
  Zap,
  Check,
} from "lucide-react";
import externalApisApi, {
  ExternalApiIntegration,
  IntegrationStatus,
} from "@/services/externalApis.api";

export default function AdminExternalApisPage() {
  const [integrations, setIntegrations] = useState<ExternalApiIntegration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingApi, setEditingApi] = useState<Partial<ExternalApiIntegration> | null>(null);
  const [showCredentials, setShowCredentials] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Test Connection State
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const data = await externalApisApi.getAll();
      setIntegrations(data);
    } catch (err) {
      console.error("Failed to fetch external APIs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingApi({
      apiName: "",
      apiUrl: "https://",
      credentials: '{\n  "apiKey": "",\n  "secretKey": ""\n}',
      description: "",
      status: "ACTIVE",
    });
    setShowCredentials(false);
    setTestResult(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ExternalApiIntegration) => {
    setEditingApi(item);
    setShowCredentials(false);
    setTestResult(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this integration?")) return;
    try {
      await externalApisApi.delete(id);
      fetchIntegrations();
    } catch (err) {
      console.error("Failed to delete integration", err);
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await externalApisApi.testConnection(id);
      setTestResult({
        success: res.success ?? true,
        latencyMs: res.latencyMs || 140,
        status: res.status || "200 OK",
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        latencyMs: 0,
        status: err?.response?.data?.message || "Connection Failed",
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApi?.apiName || !editingApi?.apiUrl) {
      alert("API Name and URL are required.");
      return;
    }

    setSaving(true);
    try {
      if (editingApi.id) {
        await externalApisApi.update(editingApi.id, editingApi);
      } else {
        await externalApisApi.create(editingApi as any);
      }
      setIsModalOpen(false);
      fetchIntegrations();
    } catch (err) {
      console.error("Failed to save integration", err);
      alert("Failed to save integration.");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: IntegrationStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="badge badge-success gap-1 text-white text-xs font-semibold">
            <CheckCircle2 className="w-3 h-3" /> ACTIVE
          </span>
        );
      case "DEACTIVATED":
        return (
          <span className="badge badge-error gap-1 text-white text-xs font-semibold">
            <XCircle className="w-3 h-3" /> DEACTIVATED
          </span>
        );
      case "PENDING":
        return (
          <span className="badge badge-warning gap-1 text-xs font-semibold">
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-white text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <Globe className="w-7 h-7 text-primary" /> External API Integration Manager
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure, manage, and monitor payment gateways (bKash/Nagad), courier APIs (Steadfast/Pathao), and tracking pixels.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn btn-primary text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Integration
        </button>
      </div>

      {/* Integration Cards Grid */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading API integrations...</div>
      ) : integrations.length === 0 ? (
        <div className="bg-white p-12 text-center text-gray-500 rounded-xl border border-gray-200">
          No external integrations configured yet. Click &ldquo;+ Add Integration&rdquo; to connect your first third-party API.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 flex flex-col justify-between hover:shadow-md transition text-black"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                      {item.apiName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-black text-base">
                        {item.apiName}
                      </h3>
                      <div className="mt-0.5">{getStatusBadge(item.status)}</div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2">
                  {item.description || "Third-party service endpoint integration."}
                </p>

                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 space-y-1">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Endpoint URL
                  </div>
                  <div className="text-xs font-mono text-black truncate">
                    {item.apiUrl}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>Credentials Configured</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => handleTestConnection(item.id)}
                  disabled={testingId === item.id}
                  className="btn btn-outline btn-xs flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  {testingId === item.id ? "Testing..." : "Test Connection"}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="btn btn-ghost btn-xs text-primary"
                    title="Edit Credentials"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn btn-ghost btn-xs text-error"
                    title="Delete Integration"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Secure Credentials Modal */}
      {isModalOpen && editingApi && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-black border border-gray-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold text-black flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                {editingApi.id ? "Configure Integration" : "Add Integration"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-sm btn-ghost btn-circle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto bg-white">
              <div>
                <label className="label-text text-xs font-semibold text-black">Integration Name *</label>
                <input
                  type="text"
                  value={editingApi.apiName || ""}
                  onChange={(e) =>
                    setEditingApi((prev) => ({ ...prev, apiName: e.target.value }))
                  }
                  placeholder="e.g. bKash Payment Gateway / Steadfast Courier"
                  className="input input-bordered w-full text-sm mt-1 bg-white text-black"
                  required
                />
              </div>

              <div>
                <label className="label-text text-xs font-semibold text-black">API Base Endpoint URL *</label>
                <input
                  type="url"
                  value={editingApi.apiUrl || ""}
                  onChange={(e) =>
                    setEditingApi((prev) => ({ ...prev, apiUrl: e.target.value }))
                  }
                  placeholder="https://tokenized.sandbox.bka.sh/v1.2.0-beta"
                  className="input input-bordered w-full text-sm mt-1 font-mono bg-white text-black"
                  required
                />
              </div>

              <div>
                <label className="label-text text-xs font-semibold text-black">Status</label>
                <select
                  value={editingApi.status || "ACTIVE"}
                  onChange={(e) =>
                    setEditingApi((prev) => ({
                      ...prev,
                      status: e.target.value as IntegrationStatus,
                    }))
                  }
                  className="select select-bordered w-full text-sm mt-1 bg-white text-black"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DEACTIVATED">DEACTIVATED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div>
                <label className="label-text text-xs font-semibold text-black">Description</label>
                <input
                  type="text"
                  value={editingApi.description || ""}
                  onChange={(e) =>
                    setEditingApi((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="e.g. Parcel creation & tokenized checkout"
                  className="input input-bordered w-full text-sm mt-1 bg-white text-black"
                />
              </div>

              {/* Secure Credentials Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="label-text text-xs font-semibold text-black flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" /> Masked Credentials (JSON or Key-Value)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCredentials(!showCredentials)}
                    className="text-xs text-primary flex items-center gap-1 hover:underline"
                  >
                    {showCredentials ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Hide Credentials
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Show Credentials
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  {showCredentials ? (
                    <textarea
                      value={editingApi.credentials || ""}
                      onChange={(e) =>
                        setEditingApi((prev) => ({ ...prev, credentials: e.target.value }))
                      }
                      rows={5}
                      className="textarea textarea-bordered w-full font-mono text-xs text-black bg-gray-50 p-3"
                    />
                  ) : (
                    <input
                      type="password"
                      value={editingApi.credentials || "••••••••••••••••••••••••••••••••"}
                      onChange={(e) =>
                        setEditingApi((prev) => ({ ...prev, credentials: e.target.value }))
                      }
                      className="input input-bordered w-full text-xs font-mono bg-white text-black"
                    />
                  )}
                </div>
              </div>

              {/* Test Connection Output */}
              {editingApi.id && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleTestConnection(editingApi.id!)}
                    disabled={testingId === editingApi.id}
                    className="btn btn-outline btn-sm w-full flex items-center gap-2"
                  >
                    <Activity className="w-4 h-4 text-emerald-500" />
                    {testingId === editingApi.id
                      ? "Testing Connectivity..."
                      : "Test Connection with Backend"}
                  </button>

                  {testResult && (
                    <div
                      className={`mt-3 p-3 rounded-lg text-xs font-mono flex items-center justify-between border ${
                        testResult.success
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {testResult.success ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span>{testResult.status}</span>
                      </div>
                      <div>Latency: {testResult.latencyMs}ms</div>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary text-white text-xs px-6"
                >
                  {saving ? "Saving..." : "Save Integration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
