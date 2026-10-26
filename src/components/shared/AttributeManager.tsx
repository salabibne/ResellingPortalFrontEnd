"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Loader2 } from "lucide-react";
import api from "@/services/axios";
import PanelPage from "@/components/panel/PanelPage";
import PanelPageHeader from "@/components/panel/PanelPageHeader";
import PanelTable from "@/components/panel/PanelTable";
import PanelModal from "@/components/panel/PanelModal";
import StatusBadge from "@/components/panel/StatusBadge";

export type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "color" | "select";
  options?: { label: string; value: string }[];
  apiSource?: string;
};

export type AttributeConfig = {
  type: string;
  title: string;
  apiEndpoint: string;
  fields: FieldConfig[];
};

type Props = {
  config: AttributeConfig;
};

export default function AttributeManager({ config }: Props) {
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, {label: string, value: string}[]>>({});

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(config.apiEndpoint);
      setRecords(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (err) {
      console.error(`Failed to fetch ${config.title}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [config.apiEndpoint, config.title]);

  const fetchDynamicOptions = useCallback(async () => {
    config.fields.forEach(async (field) => {
      if (field.type === 'select' && field.apiSource) {
        try {
          const res = await api.get(field.apiSource);
          const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          const options = data.map((item: any) => ({
            label: item.name || item.id,
            value: item.id
          }));
          setDynamicOptions(prev => ({...prev, [field.name]: options}));
        } catch (err) {
          console.error(`Failed to fetch options for ${field.name}`, err);
        }
      }
    });
  }, [config.fields]);

  useEffect(() => {
    fetchData();
    fetchDynamicOptions();
  }, [fetchData, fetchDynamicOptions]);

  const handleOpenForm = (record: any | null = null, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentRecord(record);
    // Initialize status to ACTIVE if creating new
    setFormData(record || { status: 'ACTIVE' });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentRecord(null);
    setFormData({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log(config.fields)
    // Create a clean payload to avoid sending forbidden/read-only fields (like id, createdAt)
    const payload: any = {
      status: formData.status
    };
    config.fields.forEach(f => {
      if (formData[f.name] !== undefined) {
        payload[f.name] = formData[f.name];
      }
    });

    try {
      if (currentRecord) {
        const response = await api.patch(`${config.apiEndpoint}/${currentRecord.id}`, payload);
      } else {
        await api.post(config.apiEndpoint, payload);
      }
      await fetchData();
      handleCloseForm();
    } catch (err) {
      console.error("Failed to save", err);
      alert("Failed to save record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const renderFieldValue = (record: any, f: FieldConfig) => {
    const val = record[f.name];
    if (f.type === 'color') {
      return (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-base-300"
            style={{ backgroundColor: val || '#000000' }}
          />
          {val}
        </div>
      );
    }
    if (f.type === 'select') {
      const opts = f.apiSource ? dynamicOptions[f.name] : f.options;
      const opt = opts?.find(o => o.value === val);
      if (opt) return opt.label;
      
      // Fallback if options not loaded but relation is populated
      const relationName = f.name.replace('Id', '');
      if (record[relationName] && record[relationName].name) {
        return record[relationName].name;
      }
      
      return val;
    }
    return val;
  };

  return (
    <PanelPage>
      <PanelPageHeader
        title={config.title}
        actions={
          <button
            type="button"
            onClick={(e) => handleOpenForm(null, e)}
            className="btn btn-primary btn-sm rounded-xl gap-2 text-white"
            disabled={isLoading}
          >
            <Plus size={16} /> Create New
          </button>
        }
      />

      <div className="flex gap-6 h-full items-start relative">
        {/* List View */}
        <PanelTable className="flex-1">
              <thead>
                <tr>
                  <th className="text-base-content">SL</th>
                  {config.fields.map((f) => (
                    <th className="text-base-content" key={f.name}>{f.label}</th>
                  ))}
                  <th className="text-base-content text-center">Status</th>
                  <th className="text-right text-base-content">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={config.fields.length + 2} className="text-center py-8">
                      <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={config.fields.length + 2} className="text-center py-8 text-base-content/50">
                      No records found. Click &ldquo;Create New&rdquo; to add one.
                    </td>
                  </tr>
                ) : (
                  records.map((record, index) => (
                    <tr
                      key={record.id}
                      className="hover:bg-base-200 transition-colors"
                    >
                      <td className="text-base-content">{index + 1}</td>
                      {config.fields.map((f) => (
                        <td key={f.name}>
                          {renderFieldValue(record, f)}
                        </td>
                      ))}
                      <td className="text-center">
                        {record.status ? (
                          <StatusBadge status={record.status} />
                        ) : (
                          <span className="text-base-content/40">-</span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          className="btn btn-ghost btn-sm text-primary"
                          onClick={(e) => handleOpenForm(record, e)}
                        >
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
        </PanelTable>

        {/* Form View (Modal) */}
        {isFormOpen && (
          <PanelModal
            open={isFormOpen}
            onClose={handleCloseForm}
            title={currentRecord ? `Edit ${config.title}` : `Create ${config.title}`}
            size="md"
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
                  form="attribute-form"
                  className="btn btn-primary btn-sm rounded-xl gap-2 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : currentRecord ? (
                    "Update"
                  ) : (
                    "Save"
                  )}
                </button>
              </>
            }
          >
              <form id="attribute-form" onSubmit={handleSave} className="flex flex-col gap-4">
                {config.fields.map((field) => (
                  <div className="form-control w-full" key={field.name}>
                    <label className="label">
                      <span className="label-text font-semibold text-base-content">{field.label}</span>
                    </label>
                    {field.type === "text" && (
                      <input
                        type="text"
                        className="input input-bordered w-full text-base-content bg-base-100"
                        value={formData[field.name] || ""}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required
                      />
                    )}
                    {field.type === "color" && (
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          className="h-12 w-12 cursor-pointer bg-transparent border-0 p-0"
                          value={formData[field.name] || "#000000"}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                        />
                        <input
                          type="text"
                          className="input input-bordered flex-1 text-base-content bg-base-100"
                          placeholder="#000000"
                          value={formData[field.name] || ""}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          required
                        />
                      </div>
                    )}
                    {field.type === "select" && (
                      <select
                        className="select select-bordered w-full text-base-content bg-base-100"
                        value={formData[field.name] || ""}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Select {field.label}
                        </option>
                        {(field.apiSource ? dynamicOptions[field.name] : field.options)?.map((opt) => (
                           <option key={opt.value} value={opt.value}>
                             {opt.label}
                           </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content">Status</span>
                  </label>
                  <select
                    className="select select-bordered w-full text-base-content bg-base-100"
                    value={formData.status || "ACTIVE"}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="DEACTIVATED">Deactivated</option>
                  </select>
                </div>

              </form>
          </PanelModal>
        )}
      </div>
    </PanelPage>
  );
}
