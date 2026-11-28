"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  RefreshCw,
  Truck,
} from "lucide-react";
import { Order, orderApi } from "@/services/order.api";
import TrackPanel from "@/components/courier/TrackPanel";
import PanelPage from "@/components/panel/PanelPage";
import PanelPageHeader from "@/components/panel/PanelPageHeader";
import PanelEmpty from "@/components/panel/PanelEmpty";
import PanelSkeleton from "@/components/panel/PanelSkeleton";

function getErrorMessage(err: any): string {
  if (!err?.response) {
    return "সার্ভারের সাথে সংযোগ করা যাচ্ছে না। ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।";
  }
  const message = err?.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  return message || err?.message || "কিছু একটা সমস্যা হয়েছে";
}

export default function ResellerTrackPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await orderApi.getOrders(
        1,
        100,
        undefined,
        undefined,
        undefined,
        true
      );
      setOrders(res.data || []);
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const bookedOrders = orders.filter(
    (order) => order.courierConsignmentId || order.courierTrackingCode
  );

  const options = bookedOrders.map((order) => ({
    id: order.id,
    identifier:
      order.courierConsignmentId ||
      order.courierTrackingCode ||
      order.orderRef ||
      order.id,
    label: `${order.orderRef || `#${order.id.substring(0, 8).toUpperCase()}`} — ${
      order.customerName || order.customer?.name || "কাস্টমার"
    } — #${order.courierConsignmentId || order.courierTrackingCode || "N/A"}`,
  }));

  return (
    <PanelPage width="narrow">
      <PanelPageHeader
        title="পার্সেল ট্র্যাক করুন"
        subtitle="আপনার বুক করা যেকোনো কনসাইনমেন্ট বেছে নিয়ে Steadfast-এর বর্তমান স্ট্যাটাস ও পার্সেলের যাত্রা দেখুন।"
        icon={Truck}
        actions={
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="btn btn-outline btn-sm rounded-xl gap-2"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            রিফ্রেশ
          </button>
        }
      />

      {errorMsg && (
        <div className="alert alert-error text-white text-xs font-bold shadow-sm flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="flex-1">{errorMsg}</span>
          <button
            type="button"
            className="btn btn-ghost btn-xs text-white"
            onClick={() => setErrorMsg(null)}
            aria-label="বন্ধ করুন"
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <PanelSkeleton variant="form" rows={2} />
      ) : options.length === 0 ? (
        <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm">
          <PanelEmpty
            icon={Truck}
            title="এখনো কোনো কনসাইনমেন্ট বুক হয়নি"
            text="অ্যাডমিন আপনার কোনো অর্ডার Steadfast-এ বুক করলে তার কনসাইনমেন্ট আইডি এখানে দেখা যাবে।"
            action={
              <Link href="/reseller/orders" className="btn btn-primary btn-sm rounded-xl">
                আমার অর্ডার দেখুন
              </Link>
            }
          />
        </div>
      ) : (
        <TrackPanel
          presetOptions={options}
          presetLoading={loading}
          allowManual={false}
          title="আপনার পার্সেল ট্র্যাক করুন"
          description="আপনার বুক করা একটি কনসাইনমেন্ট বেছে নিন। এখানে শুধু আপনার নিজের অর্ডারগুলোর ট্র্যাকিং দেখা যাবে।"
        />
      )}
    </PanelPage>
  );
}
