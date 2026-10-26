"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import CmsManager, { MODULE_CONFIGS } from "@/components/cms/CmsManager";
import cmsApi, { CMSModuleType } from "@/services/cms.api";
import { useCMSStore } from "@/store/useCMSStore";
import {
  Share2,
  PhoneCall,
  Layout,
  Layers,
  ShoppingBag,
  Globe,
  FileText as FileTextIcon,
  ArrowRight,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import PanelPage from "@/components/panel/PanelPage";
import PanelPageHeader from "@/components/panel/PanelPageHeader";
import PanelTabs from "@/components/panel/PanelTabs";

const MODULE_TABS: { id: CMSModuleType; label: string; icon: any }[] = [
  { id: "contact", label: "WhatsApp & Contact Info", icon: PhoneCall },
  { id: "brand", label: "Site Logo", icon: ImageIcon },
  { id: "social-media", label: "Social Media", icon: Share2 },
];

const CARD_CLASS =
  "p-4 rounded-2xl bg-base-100 border border-base-200 shadow-sm hover:border-primary/40 hover:shadow-md transition-colors flex flex-col justify-between group h-full";

export default function CMSDashboardPage() {
  const [activeTab, setActiveTab] = useState<CMSModuleType>("contact");
  const [configuredWhatsApp, setConfiguredWhatsApp] = useState<string>("");
  const editorRef = useRef<HTMLDivElement | null>(null);

  // Live value from the API — the banner must reflect whatever was just saved.
  const loadWhatsAppConfig = useCallback(async () => {
    try {
      const items = await cmsApi.getAll<any>("contact");
      const primary = items?.[0];
      setConfiguredWhatsApp(primary?.whatsapp || primary?.phone || "");
    } catch {
      setConfiguredWhatsApp("");
    }
  }, []);

  useEffect(() => {
    loadWhatsAppConfig();
  }, [loadWhatsAppConfig]);

  // After any contact edit: refresh this banner and the floating widget data.
  const handleContactSaved = useCallback(async () => {
    await loadWhatsAppConfig();
    await useCMSStore.getState().fetchPublicCMS(true);
  }, [loadWhatsAppConfig]);

  const handleEditWhatsApp = () => {
    setActiveTab("contact");
    requestAnimationFrame(() =>
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  return (
    <PanelPage>
      <PanelPageHeader
        title="Content Management System"
        subtitle="Manage site-wide contact and social links here. Homepage hero & about come from the Homepage Customizer; feature cards, team and founder pages come from the Custom Pages Builder."
        icon={Layout}
      />

      {/* Floating WhatsApp Live Chat Widget Quick Settings Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-5 rounded-2xl border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M17.507 14.307l-.009.075c-.239.004-.76.012-1.353-.298-.445-.23-1.049-.553-1.89-1.01-.22-.12-.41-.18-.58-.02-.24.23-.93.99-1.14 1.18-.21.19-.36.21-.6.09-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.58-1.4-.8-1.92-.21-.51-.43-.44-.59-.45-.15-.01-.32-.01-.49-.01-.17 0-.45.06-.69.32-.24.26-.91.89-.91 2.17 0 1.28.93 2.52 1.06 2.7.13.18 1.83 2.8 4.43 3.92.62.27 1.1.43 1.48.55.62.2 1.19.17 1.64.1.5-.07 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.11-.23-.17-.47-.28zM12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.16c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.83-1.26-4.39 0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.83c0 4.54-3.7 8.24-8.25 8.24z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base text-base-content">
                Floating WhatsApp Live Chat Widget
              </h2>
              <span className="badge badge-success badge-xs font-bold text-white px-2 py-1">Active</span>
            </div>
            <p className="text-xs text-base-content/60 mt-0.5">
              Live button displayed at bottom-right corner across all customer devices.
              Currently configured with{" "}
              <span className="font-mono font-bold text-base-content">
                {configuredWhatsApp || "no number configured"}
              </span>
              .
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleEditWhatsApp}
          className="btn btn-sm bg-[#25D366] hover:bg-[#20ba5a] text-white border-none rounded-xl gap-2 shrink-0 self-start sm:self-center"
        >
          <PhoneCall size={16} /> Edit WhatsApp Settings
        </button>
      </div>

      {/* Quick Access Modules Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/homepage" className={CARD_CLASS}>
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Layout size={20} />
            </div>
            <ArrowRight size={16} className="text-base-content/40 group-hover:text-primary transition-transform group-hover:translate-x-1" />
          </div>
          <div className="mt-3">
            <h3 className="font-bold text-sm text-base-content">Homepage Customizer</h3>
            <p className="text-xs text-base-content/60 mt-0.5">Section priority, content & promo blocks</p>
          </div>
        </Link>

        <Link href="/admin/custom-pages" className={CARD_CLASS}>
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Layers size={20} />
            </div>
            <ArrowRight size={16} className="text-base-content/40 group-hover:text-primary transition-transform group-hover:translate-x-1" />
          </div>
          <div className="mt-3">
            <h3 className="font-bold text-sm text-base-content">Custom Pages Builder</h3>
            <p className="text-xs text-base-content/60 mt-0.5">Build landing pages & dynamic sections</p>
          </div>
        </Link>

        <Link href="/admin/users" className={CARD_CLASS}>
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
              <Users size={20} />
            </div>
            <ArrowRight size={16} className="text-base-content/40 group-hover:text-primary transition-transform group-hover:translate-x-1" />
          </div>
          <div className="mt-3">
            <h3 className="font-bold text-sm text-base-content">User Management</h3>
            <p className="text-xs text-base-content/60 mt-0.5">Manage user roles and activation status</p>
          </div>
        </Link>

        <Link href="/admin/product-pages" className={CARD_CLASS}>
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShoppingBag size={20} />
            </div>
            <ArrowRight size={16} className="text-base-content/40 group-hover:text-primary transition-transform group-hover:translate-x-1" />
          </div>
          <div className="mt-3">
            <h3 className="font-bold text-sm text-base-content">Product Page CMS</h3>
            <p className="text-xs text-base-content/60 mt-0.5">Customize landing mode & videos</p>
          </div>
        </Link>

        <Link href="/admin/external-apis" className={CARD_CLASS}>
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Globe size={20} />
            </div>
            <ArrowRight size={16} className="text-base-content/40 group-hover:text-primary transition-transform group-hover:translate-x-1" />
          </div>
          <div className="mt-3">
            <h3 className="font-bold text-sm text-base-content">External API Integrations</h3>
            <p className="text-xs text-base-content/60 mt-0.5">Manage bKash, Steadfast & Pixels</p>
          </div>
        </Link>

        <Link href="/admin/legal-documents" className={CARD_CLASS}>
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
              <FileTextIcon size={20} />
            </div>
            <ArrowRight size={16} className="text-base-content/40 group-hover:text-primary transition-transform group-hover:translate-x-1" />
          </div>
          <div className="mt-3">
            <h3 className="font-bold text-sm text-base-content">Legal Documents</h3>
            <p className="text-xs text-base-content/60 mt-0.5">Terms, Privacy & Return policies</p>
          </div>
        </Link>
      </div>

      {/* Tabs Navigation + Module Content Manager */}
      <div ref={editorRef} className="flex flex-col gap-6 scroll-mt-6">
        <PanelTabs
          ariaLabel="CMS modules"
          value={activeTab}
          onChange={(id) => setActiveTab(id as CMSModuleType)}
          tabs={MODULE_TABS.map((tab) => ({
            id: tab.id,
            label: tab.label,
            icon: tab.icon,
          }))}
        />

        <CmsManager key={activeTab} module={activeTab} onSaved={handleContactSaved} />
      </div>
    </PanelPage>
  );
}
