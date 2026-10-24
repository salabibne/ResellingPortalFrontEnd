"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ExternalLink,
  MapPin,
  Package,
  RefreshCw,
  Search,
  Truck,
} from "lucide-react";
import {
  CourierTrackResult,
  orderApi,
} from "@/services/order.api";
import CourierStatusBadge from "@/components/courier/CourierStatusBadge";

interface TrackOption {
  id: string;
  label: string;
  identifier: string;
}

interface TrackPanelProps {
  presetOptions?: TrackOption[];
  presetLoading?: boolean;
  allowManual?: boolean;
  title?: string;
  description?: string;
}

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

function getErrorMessage(err: any): string {
  if (!err?.response) {
    return "Cannot reach the backend API. Make sure the backend server is running on port 3000.";
  }
  const message = err?.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  return message || err?.message || "Something went wrong";
}

export default function TrackPanel({
  presetOptions,
  presetLoading = false,
  allowManual = true,
  title = "Track a Parcel",
  description = "Track a consignment by consignment ID, tracking code, or invoice. No status is written to the order.",
}: TrackPanelProps) {
  const [loadedOptions, setLoadedOptions] = useState<TrackOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedIdentifier, setSelectedIdentifier] = useState("");
  const [manualIdentifier, setManualIdentifier] = useState("");
  const [result, setResult] = useState<CourierTrackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const options = presetOptions ?? loadedOptions;
  const optionsLoading = presetOptions ? presetLoading : loadingOptions;

  useEffect(() => {
    if (presetOptions) return;

    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        const res = await orderApi.getCourierShipments({
          page: 1,
          limit: 100,
          shipmentState: "BOOKED",
        });
        setLoadedOptions(
          (res.data || []).map((order) => ({
            id: order.id,
            identifier:
              order.courierConsignmentId ||
              order.courierTrackingCode ||
              order.orderRef ||
              order.id,
            label: `${order.orderRef || `#${order.id.substring(0, 8).toUpperCase()}`} — ${
              order.customerName || order.customer?.name || "Customer"
            } — #${order.courierConsignmentId || order.courierTrackingCode || "N/A"}`,
          }))
        );
      } catch {
        setLoadedOptions([]);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, [presetOptions]);

  const identifier = useMemo(() => {
    return (allowManual ? manualIdentifier.trim() : "") || selectedIdentifier;
  }, [allowManual, manualIdentifier, selectedIdentifier]);

  const handleTrack = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrorMsg(null);
    setResult(null);

    if (!identifier) {
      setErrorMsg("Select a consignment ID or enter one to track.");
      return;
    }

    try {
      setLoading(true);
      const res = await orderApi.trackCourierParcel(identifier);
      setResult(res);
    } catch (err: any) {
      const message = getErrorMessage(err);
      setErrorMsg(
        message.includes("401")
          ? `${message} If this consignment belongs to your Steadfast account, check the API keys under Backend/.env.`
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  const isAuthError = !!errorMsg && errorMsg.includes("401");

  return (
    <div className="space-y-5">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Search size={18} className="text-primary" /> {title}
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
        </div>

        <form onSubmit={handleTrack} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Pick a booked consignment
            </label>
            <select
              value={selectedIdentifier}
              onChange={(e) => {
                setSelectedIdentifier(e.target.value);
                setManualIdentifier("");
              }}
              className="select select-sm select-bordered w-full rounded-xl text-slate-900"
              disabled={optionsLoading}
            >
              <option value="">
                {optionsLoading
                  ? "Loading consignments..."
                  : options.length === 0
                    ? "No booked consignments available"
                    : "Select a consignment..."}
              </option>
              {options.map((option) => (
                <option key={option.id} value={option.identifier}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {allowManual && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Or enter a consignment ID / tracking code / invoice
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={manualIdentifier}
                  onChange={(e) => {
                    setManualIdentifier(e.target.value);
                    setSelectedIdentifier("");
                  }}
                  placeholder="e.g. 1424107, 15BAEB8A, or ORD-10231"
                  className="input input-sm input-bordered flex-1 rounded-xl text-slate-900"
                />
                <button
                  type="submit"
                  disabled={loading || !identifier}
                  className="btn btn-sm btn-primary text-white font-bold rounded-xl gap-2"
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <Search size={14} />
                  )}
                  {loading ? "Tracking..." : "Track Parcel"}
                </button>
              </div>
            </div>
          )}

          {!allowManual && (
            <button
              type="submit"
              disabled={loading || !identifier}
              className="btn btn-sm btn-primary text-white font-bold rounded-xl gap-2 w-full"
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <Search size={14} />
              )}
              {loading ? "Tracking..." : "Track Parcel"}
            </button>
          )}
        </form>
      </div>

      {errorMsg && (
        <div className="alert alert-error text-white text-xs font-bold shadow-sm flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <div>{errorMsg}</div>
            {isAuthError && (
              <div className="text-[10px] font-medium text-white/80 mt-1">
                A 401 means either the API keys were rejected or this parcel
                belongs to another Steadfast profile (Courier.md). Check
                GET /orders/courier/auth-status: pingOk = base URL reachable,
                balanceOk = keys accepted.
              </div>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-primary" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Parcel Status
                </h3>
                <CourierStatusBadge status={result.deliveryStatus} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Matched by {result.matchedBy.toUpperCase()} ·{" "}
                {result.matchedIdentifier || result.identifier}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTrack()}
              disabled={loading}
              className="btn btn-xs btn-outline rounded-lg font-bold gap-1"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Track Again
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Consignment ID
              </span>
              <span className="font-mono font-bold text-slate-900">
                {result.consignmentId ? `#${result.consignmentId}` : "-"}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Tracking Code
              </span>
              <span className="font-mono font-bold text-indigo-700">
                {result.trackingCode || "-"}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Order / Customer
              </span>
              <span className="font-bold text-slate-800">
                {result.orderRef || "-"}
                {result.customerName ? ` · ${result.customerName}` : ""}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Last Persisted Sync
              </span>
              <span className="font-medium text-slate-700">
                {formatDateTime(result.lastSyncedAt)}
              </span>
            </div>
          </div>

          {(result.trackingLink || result.returnStatus) && (
            <div className="px-5 pb-5 flex flex-wrap items-center gap-3 text-xs">
              {result.trackingLink && (
                <a
                  href={result.trackingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-xs btn-outline btn-primary rounded-lg font-bold gap-1"
                >
                  <ExternalLink size={12} /> Open Steadfast Tracking
                </a>
              )}
              {result.returnStatus && (
                <span className="badge badge-warning text-slate-900 font-bold uppercase text-[10px]">
                  Return: {result.returnStatus}
                </span>
              )}
              {result.returnReason && (
                <span className="text-[11px] text-slate-500">
                  Reason: {result.returnReason}
                </span>
              )}
              {result.returnRequestedAt && (
                <span className="text-[11px] text-slate-500">
                  Requested: {formatDateTime(result.returnRequestedAt)}
                </span>
              )}
            </div>
          )}

          <div className="border-t border-slate-100 p-5">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <MapPin size={13} className="text-primary" /> Journey (
              {result.trackingEvents?.length || 0})
            </h4>

            {result.trackingEvents?.length ? (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
                {result.trackingEvents.map((event, index) => (
                  <div key={`${event.created_at}-${index}`} className="relative">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-primary border-2 border-white shadow-sm flex items-center justify-center text-[8px] text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-900">
                        {event.text}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {formatDateTime(event.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-100">
                <Package size={14} className="text-slate-400" />
                No tracking milestones returned yet. The status above is the
                latest provider response.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
