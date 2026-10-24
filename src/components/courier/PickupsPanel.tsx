"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  PackageCheck,
  RefreshCw,
  Send,
} from "lucide-react";
import {
  CourierPickup,
  orderApi,
  PoliceStation,
} from "@/services/order.api";

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

function getStationLabel(station: PoliceStation): string {
  const name =
    station.name ||
    (station as any).station_name ||
    (station as any).police_station ||
    `Station #${station.id}`;
  const district =
    station.district ||
    (station as any).district_name ||
    (station as any).thana ||
    "";
  return district ? `${name} — ${district}` : name;
}

export default function PickupsPanel() {
  const [pickups, setPickups] = useState<CourierPickup[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);

  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [policeStationId, setPoliceStationId] = useState("");
  const [addressId, setAddressId] = useState("");
  const [estimQty, setEstimQty] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadPickups = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await orderApi.getCourierPickups(page, limit);
      setPickups(res.data || []);
      setMeta({
        total: res.meta?.total || 0,
        totalPages: res.meta?.totalPages || 1,
      });
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const loadStations = async () => {
    try {
      setLoadingStations(true);
      const res = await orderApi.getPoliceStations();
      const flat: PoliceStation[] = [];

      for (const district of res.data || []) {
        if (Array.isArray((district as any).policestations)) {
          for (const station of (district as any).policestations) {
            flat.push({
              id: station.id,
              name: station.name,
              district: district.name,
            });
          }
        } else if (district.id && district.name) {
          flat.push(district);
        }
      }

      setStations(flat);
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoadingStations(false);
    }
  };

  useEffect(() => {
    loadPickups();
  }, [loadPickups]);

  useEffect(() => {
    loadStations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!address.trim() || !contactNumber.trim()) {
      setErrorMsg("Address and contact number are required.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await orderApi.createCourierPickup({
        address: address.trim(),
        contactNumber: contactNumber.trim(),
        ...(policeStationId ? { policeStationId: Number(policeStationId) } : {}),
        ...(addressId ? { addressId: Number(addressId) } : {}),
        ...(estimQty ? { estimQty: Number(estimQty) } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      setSuccessMsg(res.message || "Pickup request submitted to Steadfast.");
      setAddress("");
      setContactNumber("");
      setPoliceStationId("");
      setAddressId("");
      setEstimQty("");
      setNote("");
      setPage(1);
      await loadPickups();
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="alert alert-success text-white text-xs font-bold shadow-sm flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
          <button
            type="button"
            className="btn btn-ghost btn-xs ml-auto text-white"
            onClick={() => setSuccessMsg(null)}
          >
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-error text-white text-xs font-bold shadow-sm flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="flex-1">{errorMsg}</span>
          <button
            type="button"
            className="btn btn-ghost btn-xs text-white"
            onClick={() => setErrorMsg(null)}
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4"
        >
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <PackageCheck size={18} className="text-primary" /> New Pickup Request
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Pickup Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder="Warehouse / pickup address"
                className="textarea textarea-bordered w-full rounded-xl text-slate-900"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Contact Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="input input-sm input-bordered w-full rounded-xl text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Estimated Parcels
                </label>
                <input
                  type="number"
                  min={1}
                  value={estimQty}
                  onChange={(e) => setEstimQty(e.target.value)}
                  placeholder="e.g. 20"
                  className="input input-sm input-bordered w-full rounded-xl text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Police Station</span>
                <button
                  type="button"
                  onClick={loadStations}
                  disabled={loadingStations}
                  className="btn btn-ghost btn-xs text-primary px-1"
                >
                  <RefreshCw
                    size={11}
                    className={loadingStations ? "animate-spin" : ""}
                  />
                </button>
              </label>
              <select
                value={policeStationId}
                onChange={(e) => setPoliceStationId(e.target.value)}
                className="select select-sm select-bordered w-full rounded-xl text-slate-900"
              >
                <option value="">Select police station (optional)</option>
                {stations.map((station) => (
                  <option key={station.id} value={String(station.id)}>
                    {getStationLabel(station)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Saved Address ID
              </label>
              <input
                type="number"
                min={1}
                value={addressId}
                onChange={(e) => setAddressId(e.target.value)}
                placeholder="Steadfast saved address ID (optional)"
                className="input input-sm input-bordered w-full rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Note
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Pickup instructions"
                className="input input-sm input-bordered w-full rounded-xl text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-sm w-full text-white font-bold rounded-xl gap-2"
          >
            {submitting ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <Send size={14} />
            )}
            {submitting ? "Submitting..." : "Submit Pickup Request"}
          </button>
        </form>

        <div className="xl:col-span-3 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin size={16} className="text-primary" /> Pickup History
            </h2>
            <button
              onClick={loadPickups}
              disabled={loading}
              className="btn btn-xs btn-outline rounded-lg font-bold gap-1"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="h-56 flex items-center justify-center">
              <span className="loading loading-spinner loading-md text-primary"></span>
            </div>
          ) : pickups.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <PackageCheck size={40} className="mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-slate-700">No pickups yet</p>
              <p className="text-xs">Submitted pickup requests will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th>Requested</th>
                    <th>Address</th>
                    <th>Contact</th>
                    <th>Qty</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pickups.map((pickup) => (
                    <tr key={pickup.id} className="align-top">
                      <td className="whitespace-nowrap">
                        {formatDateTime(pickup.createdAt)}
                      </td>
                      <td>
                        <div className="font-medium text-slate-800 line-clamp-2">
                          {pickup.address}
                        </div>
                        {pickup.note && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Note: {pickup.note}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap">{pickup.contactNumber}</td>
                      <td>{pickup.estimQty ?? "-"}</td>
                      <td>
                        <span className="badge badge-info text-white text-[10px] font-bold uppercase py-1.5 px-2">
                          {pickup.status || "requested"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {meta.totalPages > 1 && (
            <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[11px] text-slate-500">
                Page {page} of {meta.totalPages} ({meta.total} pickups)
              </span>
              <div className="flex gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn btn-xs btn-outline rounded-lg"
                >
                  <ChevronLeft size={12} />
                </button>
                <button
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  className="btn btn-xs btn-outline rounded-lg"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
