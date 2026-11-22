"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Clock,
  Gift,
  Globe,
  LayoutDashboard,
  LifeBuoy,
  MapPin,
  Network,
  Package,
  PieChart,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  Undo2,
  UserCircle,
  UserCheck,
  Users,
  Wallet,
  Coins,
} from "lucide-react";
import PanelPage from "@/components/panel/PanelPage";
import VerifyBadge from "@/components/reseller/VerifyBadge";
import { resolveImageUrl } from "@/components/homepage/SafeImage";
import { orderApi, type ResellerStats } from "@/services/order.api";
import { withdrawalApi, type ResellerWalletSummary } from "@/services/withdrawal.api";
import { productApi, type Product } from "@/services/product.api";
import { useAuthStore } from "@/store/useAuthStore";
import { useResellerProfileStore } from "@/store/useResellerProfileStore";

type Icon = ComponentType<{ size?: number | string; className?: string }>;

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** 1234 → "১,২৩৪" */
function bn(value: number | string | undefined | null): string {
  const n = Number(value || 0);
  const formatted = Number.isInteger(n)
    ? n.toLocaleString("en-IN")
    : n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  return formatted.replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

function taka(value: number | string | undefined | null): string {
  return `৳${bn(value)}`;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "শুভ রাত্রি";
  if (hour < 12) return "শুভ সকাল";
  if (hour < 16) return "শুভ দুপুর";
  if (hour < 19) return "শুভ বিকাল";
  return "শুভ সন্ধ্যা";
}

interface Shortcut {
  label: string;
  icon: Icon;
  href?: string;
  external?: boolean;
  soon?: boolean;
}

const SHORTCUTS: Shortcut[] = [
  { label: "ড্যাশবোর্ড", icon: PieChart, href: "/reseller" },
  { label: "প্রোডাক্ট", icon: Store, href: "/reseller/products" },
  { label: "প্যাকেজ", icon: Boxes, soon: true },
  { label: "চেকআউট", icon: ShoppingCart, href: "/reseller/cart" },
  { label: "অর্ডার", icon: ClipboardList, href: "/reseller/orders" },
  { label: "কাস্টমার", icon: Users, soon: true },
  { label: "রেফারাল", icon: Network, soon: true },
  { label: "বোনাস", icon: Gift, soon: true },
  { label: "ওয়ালেট", icon: Wallet, href: "/reseller/payouts" },
  { label: "উইথড্র", icon: Banknote, href: "/reseller/payouts" },
  { label: "ফ্রড চেক", icon: ShieldCheck, soon: true },
  { label: "ভেরিফাই", icon: UserCheck, href: "/reseller/profile" },
  { label: "প্রোফাইল", icon: UserCircle, href: "/reseller/profile" },
  { label: "ট্র্যাক", icon: Truck, href: "/reseller/track" },
  { label: "সাপোর্ট", icon: LifeBuoy, href: "/reseller/support" },
  { label: "ওয়েবসাইট", icon: Globe, href: "/", external: true },
];

export default function ResellerDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const profile = useResellerProfileStore((state) => state.profile);
  const [stats, setStats] = useState<ResellerStats | null>(null);
  const [wallet, setWallet] = useState<ResellerWalletSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.allSettled([
      orderApi.getResellerStats(),
      withdrawalApi.getWalletSummary(),
      productApi.getAll(),
    ]).then(([statsRes, walletRes, productsRes]) => {
      if (!alive) return;
      if (statsRes.status === "fulfilled") setStats(statsRes.value);
      if (walletRes.status === "fulfilled") setWallet(walletRes.value);
      if (productsRes.status === "fulfilled") {
        setProducts(productsRes.value.filter((p) => p.status === "ACTIVE").slice(0, 12));
      }
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const name = profile?.name || user?.name || "উদ্যোক্তা";
  const avatarUrl = resolveImageUrl(profile?.imageUrl);
  const address = useMemo(
    () => [profile?.presentThana, profile?.presentDistrict].filter(Boolean).join(", "),
    [profile?.presentThana, profile?.presentDistrict],
  );

  const pendingCount =
    Number(stats?.pendingOrders || 0) + Number(stats?.orderPlacedOrders || 0) + Number(stats?.inTransitOrders || 0);
  const returnedCount = Number(stats?.returnedOrders ?? 0) || Number(stats?.cancelledOrders || 0);

  return (
    <PanelPage>
      <div className="space-y-4 sm:space-y-5">
        {/* ── Hero: reseller profile, address and verify light ───────────── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-900 p-4 sm:p-6 text-white shadow-lg shadow-teal-900/20">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 right-24 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex items-start gap-3 sm:gap-4">
            <div className="relative shrink-0">
              <div className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full border-[3px] border-white/80 bg-white/15 shadow-md">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-black">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <VerifyBadge variant="dot" className="absolute -bottom-0.5 -right-0.5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-100/80">
                Reseller Account
              </p>
              <p className="text-xs text-teal-50/90">{greeting()},</p>
              <h1 className="truncate text-lg sm:text-2xl font-extrabold leading-tight">{name}</h1>
              {profile?.pageName && (
                <p className="truncate text-xs text-teal-50/80">{profile.pageName}</p>
              )}
            </div>

            <div className="shrink-0 text-right">
              <p className="text-3xl sm:text-4xl font-black leading-none">{bn(stats?.todayOrders ?? 0)}</p>
              <p className="mt-1 text-[10px] sm:text-xs text-teal-50/80 leading-tight">
                আজকের
                <br />
                অর্ডার
              </p>
            </div>
          </div>

          <div className="relative mt-4 flex flex-wrap items-center gap-2">
            {address ? (
              <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-semibold">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{address}</span>
              </span>
            ) : (
              <Link
                href="/reseller/profile"
                className="inline-flex items-center gap-1 rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-semibold hover:bg-black/30"
              >
                <MapPin size={12} /> ঠিকানা যোগ করুন
              </Link>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-semibold">
              রিসেলার
            </span>
            {profile?.status === "ACTIVE" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-teal-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
              </span>
            )}
            <VerifyBadge variant="chip" onDark />
          </div>

          {profile && !profile.verification?.isVerified && (
            <Link
              href="/reseller/profile"
              className="relative mt-3 flex items-center justify-between gap-2 rounded-2xl bg-white/10 px-3 py-2 text-[11px] ring-1 ring-white/20 hover:bg-white/15"
            >
              <span>
                প্রোফাইল সম্পূর্ণ করুন ({bn(profile.verification.completed)}/{bn(profile.verification.total)}) — ভেরিফাই না হলে অর্ডার করা যাবে না।
              </span>
              <ArrowRight size={14} className="shrink-0" />
            </Link>
          )}
        </section>

        {/* ── Stat cards ─────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="পেন্ডিং" value={bn(pendingCount)} icon={Clock} tone="blue" loading={loading} href="/reseller/orders" />
          <StatCard label="ডেলিভারড" value={bn(stats?.deliveredOrders)} icon={CheckCircle2} tone="green" loading={loading} href="/reseller/orders" />
          <StatCard label="ফেরত" value={bn(returnedCount)} icon={Undo2} tone="orange" loading={loading} href="/reseller/orders" />
          <StatCard label="মোট আয়" value={taka(stats?.totalResellerProfit)} icon={Coins} tone="amber" loading={loading} href="/reseller/payouts" />
        </section>

        {/* ── Earnings (commission based) ────────────────────────────────── */}
        <section className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-100/70 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold text-amber-800/70">আয়ের ধরন</p>
              <p className="text-sm sm:text-base font-extrabold text-amber-900">কমিশন ভিত্তিক</p>
            </div>
            <Link href="/reseller/payouts" className="text-[11px] font-semibold text-teal-700 hover:underline">
              ইতিহাস দেখুন →
            </Link>
            <Link
              href="/reseller/payouts"
              className="btn btn-sm rounded-xl border-none bg-emerald-500 text-white hover:bg-emerald-600 gap-1"
            >
              <ArrowUpRight size={14} /> উত্তোলন
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <MiniStat label="উত্তোলনযোগ্য" value={taka(wallet?.withdrawableBalance)} loading={loading} />
            <MiniStat label="পেন্ডিং প্রফিট" value={taka(wallet?.pendingProfit ?? stats?.pendingResellerProfit)} loading={loading} />
            <MiniStat label="মোট উত্তোলন" value={taka(wallet?.totalWithdrawn)} loading={loading} />
          </div>
          <p className="mt-2 text-center text-[11px] text-amber-900/60">
            মোট অর্ডার: {bn(stats?.totalOrders)} · মোট বিক্রি: {taka(stats?.totalResellerSales)}
          </p>
        </section>

        {/* ── Quick shortcuts ────────────────────────────────────────────── */}
        <section className="rounded-3xl border border-base-200 bg-base-100 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold">দ্রুত শর্টকাট</h2>
            <Link href="/reseller/products" className="text-[11px] font-semibold text-teal-700 hover:underline">
              সব মেনু →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-6 lg:grid-cols-8">
            {SHORTCUTS.map((item) => (
              <ShortcutTile key={item.label} item={item} />
            ))}
          </div>
        </section>

        {/* ── Popular products ──────────────────────────────────────────── */}
        <section className="rounded-3xl border border-base-200 bg-base-100 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold">জনপ্রিয় পণ্য</h2>
            <Link href="/reseller/products" className="text-[11px] font-semibold text-teal-700 hover:underline">
              সব দেখুন →
            </Link>
          </div>
          {loading ? (
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-44 w-32 shrink-0 animate-pulse rounded-2xl bg-base-200" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-base-300 p-6 text-center text-xs text-base-content/60">
              <Package size={22} /> এখনো কোনো পণ্য নেই
            </div>
          ) : (
            <div className="no-scrollbar -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1">
              {products.map((product) => (
                <ProductTile key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        <p className="flex items-center justify-center gap-1 pb-2 text-[10px] text-base-content/40">
          <LayoutDashboard size={11} /> Online Uddokta Platform
        </p>
      </div>
    </PanelPage>
  );
}

const TONES = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  orange: "bg-orange-50 text-orange-500",
  amber: "bg-amber-50 text-amber-600",
} as const;

function StatCard({
  label,
  value,
  icon: IconCmp,
  tone,
  loading,
  href,
}: {
  label: string;
  value: string;
  icon: Icon;
  tone: keyof typeof TONES;
  loading: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start justify-between gap-2 rounded-2xl border border-base-200 bg-base-100 p-3 sm:p-4 shadow-sm transition hover:border-teal-300 hover:shadow-md"
    >
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-base-content/60">{label}</p>
        {loading ? (
          <div className="mt-1.5 h-6 w-12 animate-pulse rounded bg-base-200" />
        ) : (
          <p className="mt-0.5 truncate text-xl sm:text-2xl font-black">{value}</p>
        )}
      </div>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONES[tone]}`}>
        <IconCmp size={16} />
      </span>
    </Link>
  );
}

function MiniStat({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <div className="rounded-2xl bg-white/70 px-2 py-2.5 text-center ring-1 ring-amber-200/70">
      <p className="text-[10px] font-semibold text-amber-900/60">{label}</p>
      {loading ? (
        <div className="mx-auto mt-1 h-4 w-10 animate-pulse rounded bg-amber-100" />
      ) : (
        <p className="truncate text-sm sm:text-base font-extrabold text-amber-950">{value}</p>
      )}
    </div>
  );
}

function ShortcutTile({ item }: { item: Shortcut }) {
  const IconCmp = item.icon;
  const inner = (
    <>
      <span
        className={`relative flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm transition ${
          item.soon
            ? "bg-base-200 text-base-content/35"
            : "bg-teal-50 text-teal-700 ring-1 ring-teal-100 group-hover:bg-teal-600 group-hover:text-white"
        }`}
      >
        <IconCmp size={20} />
        {item.soon && (
          <span className="absolute -right-2 -top-1.5 rounded-full bg-amber-400 px-1 text-[8px] font-bold leading-[14px] text-amber-950">
            শীঘ্রই
          </span>
        )}
      </span>
      <span className={`text-center text-[10px] sm:text-[11px] font-semibold leading-tight ${item.soon ? "text-base-content/40" : ""}`}>
        {item.label}
      </span>
    </>
  );

  const className = "group flex flex-col items-center gap-1.5";

  if (item.soon || !item.href) {
    return (
      <div className={`${className} cursor-not-allowed`} title="শীঘ্রই আসছে" aria-disabled>
        {inner}
      </div>
    );
  }
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className}>
      {inner}
    </Link>
  );
}

function ProductTile({ product }: { product: Product }) {
  const image =
    product.images?.find((img) => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
  return (
    <Link
      href="/reseller/products"
      className="w-32 sm:w-36 shrink-0 snap-start overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-square w-full bg-base-200">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolveImageUrl(image)} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-base-content/30">
            <Package size={24} />
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="truncate text-[11px] font-semibold">{product.name}</p>
        <p className="text-xs font-extrabold text-teal-700">{taka(product.resellerPrice)}</p>
      </div>
    </Link>
  );
}
