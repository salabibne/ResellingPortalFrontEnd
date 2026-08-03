"use client";

import React, { useState } from "react";
import CmsManager, { MODULE_CONFIGS } from "@/components/cms/CmsManager";
import { CMSModuleType } from "@/services/cms.api";
import {
  Share2,
  PhoneCall,
  Layout,
  Info,
  Grid,
  UserCheck,
  BookOpen,
  Video,
} from "lucide-react";

const MODULE_TABS: { id: CMSModuleType; label: string; icon: any }[] = [
  { id: "social-media", label: "Social Media", icon: Share2 },
  { id: "contact", label: "Contact Info", icon: PhoneCall },
  { id: "hero", label: "Hero Banner", icon: Layout },
  { id: "about", label: "About Section", icon: Info },
  { id: "section", label: "Feature Cards", icon: Grid },
  { id: "founder", label: "Founder Profile", icon: UserCheck },
  { id: "founder-blog", label: "Founder Blogs", icon: BookOpen },
  { id: "founder-video", label: "Founder Videos", icon: Video },
];

export default function CMSDashboardPage() {
  const [activeTab, setActiveTab] = useState<CMSModuleType>("social-media");

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20">
        <h1 className="text-3xl font-extrabold text-black">Content Management System</h1>
        <p className="text-sm text-base-content/70 mt-1">
          Configure site content, banners, videos, founder updates, and contact information.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-base-200/80 rounded-2xl border border-base-300 scrollbar-none">
        {MODULE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-primary text-white shadow-md"
                  : "text-base-content/80 hover:text-black hover:bg-base-100"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Module Content Manager */}
      <CmsManager key={activeTab} module={activeTab} />
    </div>
  );
}
