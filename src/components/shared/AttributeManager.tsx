"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, X, Loader2 } from "lucide-react";
import api from "@/services/axios";

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
    <div className="p-6 w-full flex flex-col h-full bg-base-200 text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">{config.title}</h1>
        <button
          onClick={(e) => handleOpenForm(null, e)}
          className="btn btn-primary flex items-center gap-2"
          disabled={isLoading}
        >
          <Plus size={20} /> Create New
        </button>
      </div>

      <div className="flex gap-6 h-full items-start relative">
        {/* List View */}
        <div className="bg-base-100 rounded-box shadow-md flex-1 overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-black">SL</th>
                  {config.fields.map((f) => (
                    <th className="text-black" key={f.name}>{f.label}</th>
                  ))}
                  <th className="text-black text-center">Status</th>
                  <th className="text-right text-black">Actions</th>
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
                    <td colSpan={config.fields.length + 2} className="text-center py-8 text-black/50">
                      No records found. Click "Create New" to add one.
                    </td>
                  </tr>
                ) : (
                  records.map((record, index) => (
                    <tr
                      key={record.id}
                      className="hover:bg-base-200 transition-colors"
                    >
                      <td className="text-black">{index + 1}</td>
                      {config.fields.map((f) => (
                        <td key={f.name}>
                          {renderFieldValue(record, f)}
                        </td>
                      ))}
                      <td className="text-center">
                        {(record.status === 'ACTIVE' || record.status === 'active') && <button className="btn btn-xs btn-success text-white">Active</button>}
                        {(record.status === 'PENDING' || record.status === 'pending') && <button className="btn btn-xs btn-warning text-white">Pending</button>}
                        {(record.status === 'DEACTIVATED' || record.status === 'deactivated') && <button className="btn btn-xs btn-error text-white">Deactivated</button>}
                        {!['ACTIVE', 'PENDING', 'DEACTIVATED', 'active', 'pending', 'deactivated'].includes(record.status) && record.status && (
                          <button className="btn btn-xs capitalize">{record.status.toLowerCase()}</button>
                        )}
                        {!record.status && <span className="text-gray-400">-</span>}
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
            </table>
          </div>
        </div>

        {/* Form View (Modal) */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-base-100 rounded-box shadow-2xl p-6 w-full max-w-lg relative animate-in zoom-in-95 fade-in duration-200">
              <button
                onClick={handleCloseForm}
                className="btn btn-ghost btn-sm btn-circle absolute top-4 right-4"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-black">
                {currentRecord ? `Edit ${config.title}` : `Create ${config.title}`}
              </h2>
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                {config.fields.map((field) => (
                  <div className="form-control w-full" key={field.name}>
                    <label className="label">
                      <span className="label-text font-semibold text-black">{field.label}</span>
                    </label>
                    {field.type === "text" && (
                      <input
                        type="text"
                        className="input input-bordered w-full text-black bg-white"
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
                          className="input input-bordered flex-1 text-black bg-white"
                          placeholder="#000000"
                          value={formData[field.name] || ""}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          required
                        />
                      </div>
                    )}
                    {field.type === "select" && (
                      <select
                        className="select select-bordered w-full text-black bg-white"
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
                    <span className="label-text font-semibold text-black">Status</span>
                  </label>
                  <select
                    className="select select-bordered w-full text-black bg-white"
                    value={formData.status || "ACTIVE"}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="DEACTIVATED">Deactivated</option>
                  </select>
                </div>

                <div className="mt-8 flex gap-3 justify-end">
                  <button type="button" className="btn btn-ghost text-black" onClick={handleCloseForm} disabled={isSubmitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-8" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : currentRecord ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
