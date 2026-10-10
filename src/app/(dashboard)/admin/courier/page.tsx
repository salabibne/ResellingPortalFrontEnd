"use client";

import React, { useState, useEffect } from "react";
import { Truck, Save, CheckCircle2, AlertCircle, RefreshCw, Eye, Info, Users, User } from "lucide-react";
import { orderApi, CourierPolicy } from "@/services/order.api";

export default function AdminCourierPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [policy, setPolicy] = useState<CourierPolicy | null>(null);

  // Form Fields
  const [title, setTitle] = useState<string>("Courier Charge Policy");
  const [chargeText, setChargeText] = useState<string>("");
  const [defaultCharge, setDefaultCharge] = useState<number>(120);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadPolicy = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await orderApi.getCourierPolicy();
      if (res) {
        setPolicy(res);
        setTitle(res.title || "Courier Charge Policy");
        setChargeText(res.chargeText || "");
        setDefaultCharge(res.defaultCharge || 120);
      }
    } catch (err: any) {
      console.error("Failed to fetch courier policy:", err);
      setErrorMsg("Failed to load courier policy settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicy();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg(null);
      setErrorMsg(null);

      const updated = await orderApi.updateCourierPolicy({
        title: title.trim(),
        chargeText: chargeText.trim(),
        defaultCharge: Number(defaultCharge || 120),
      });

      setPolicy(updated);
      setSuccessMsg("Courier charge policy text updated successfully! This change reflects on both Reseller & Normal User checkout.");
    } catch (err: any) {
      console.error("Failed to update courier policy:", err);
      setErrorMsg(err?.response?.data?.message || "Failed to update courier charge policy text.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="text-primary" /> Courier Charge Text Policy Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure courier charge policy text & default fees. Updates reflect instantly across both **Reseller Checkout** and **Normal Customer Checkout**.
          </p>
        </div>

        <button
          onClick={loadPolicy}
          className="btn btn-sm btn-outline rounded-xl font-bold gap-2 self-start md:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success text-xs font-bold text-white shadow-sm flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-error text-xs font-bold text-white shadow-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Truck size={18} className="text-primary" />
            <span>Edit Courier Charge Policy</span>
          </h2>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Policy Title
              </label>
              <input
                type="text"
                required
                className="input input-sm input-bordered w-full rounded-xl font-bold text-slate-900"
                placeholder="e.g. Standard Courier Charge Policy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Courier Charge Info Text (Displayed to Resellers & Normal Users)
              </label>
              <textarea
                rows={5}
                required
                placeholder="Write your courier rates instructions... e.g. Inside Dhaka: ৳70 | Sub-Urban Dhaka: ৳100 | Outside Dhaka: ৳130. Advance courier fee applies."
                className="textarea textarea-bordered w-full rounded-xl text-slate-900 text-xs font-medium"
                value={chargeText}
                onChange={(e) => setChargeText(e.target.value)}
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                This exact text format is rendered on checkout pages for resellers and normal users.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Default Base Courier Charge (৳)
              </label>
              <input
                type="number"
                min="0"
                required
                className="input input-sm input-bordered w-full rounded-xl font-bold text-slate-900"
                value={defaultCharge}
                onChange={(e) => setDefaultCharge(Number(e.target.value))}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary w-full text-white font-extrabold rounded-2xl gap-2 text-sm shadow-lg shadow-primary/20"
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span> Saving Changes...
                </>
              ) : (
                <>
                  <Save size={16} /> Save & Apply Courier Policy
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Previews Container */}
        <div className="space-y-6">
          {/* Reseller Preview Card */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Users size={14} /> Reseller Checkout Preview (/reseller/cart)
              </h3>
              <span className="badge badge-primary text-[10px]">RESELLER VIEW</span>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-indigo-300">
                <Info size={14} />
                <span>{title || "Courier Policy"}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {chargeText || "No text set yet."}
              </p>
            </div>
            <div className="text-[11px] text-slate-400">
              Default Base Charge: <strong className="text-white">৳{defaultCharge}</strong>
            </div>
          </div>

          {/* Normal Customer Checkout Preview Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <User size={14} className="text-emerald-600" /> Normal Customer Checkout Preview (/checkout)
              </h3>
              <span className="badge badge-accent text-[10px]">PUBLIC VIEW</span>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                <Truck size={14} className="text-emerald-600" />
                <span>{title || "Courier Policy"}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {chargeText || "No text set yet."}
              </p>
            </div>
            <div className="text-[11px] text-slate-500">
              Applied Courier Fee: <strong className="text-slate-900">৳{defaultCharge}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
