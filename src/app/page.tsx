import React from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import HeroSection from "@/components/public/HeroSection";
import AboutSection from "@/components/public/AboutSection";
import HomeProductsSection from "@/components/public/HomeProductsSection";
import HomeCustomBanner from "@/components/public/HomeCustomBanner";
import ScrollReveal, { RevealVariant } from "@/components/public/ScrollReveal";
import customPagesApi, { CustomPage, CustomPageSection } from "@/services/customPages.api";

export const dynamic = "force-dynamic"; // Always fetch fresh homepage data so customizer changes reflect immediately

const KNOWN_VARIANTS: string[] = [
  "fade-up",
  "slide-left",
  "slide-right",
  "zoom-in",
  "zoom-out",
  "none",
];

// Per-type defaults so the page has motion variety until an admin picks one.
const TYPE_DEFAULTS: Array<[string, RevealVariant]> = [
  ["hero", "zoom-in"],
  ["product", "fade-up"],
  ["about", "slide-left"],
  ["banner", "slide-right"],
];

const resolveRevealVariant = (secType: string, content: any): RevealVariant => {
  const configured = String(content?.animation || "").toLowerCase();
  if (KNOWN_VARIANTS.includes(configured)) return configured as RevealVariant;

  const match = TYPE_DEFAULTS.find(([key]) => secType.includes(key));
  return match ? match[1] : "fade-up";
};

export default async function Home() {
  let homePage: CustomPage | null = null;

  try {
    homePage = await customPagesApi.getBySlug("home");
  } catch (err) {
    // If backend is unreachable or not yet seeded, default to fallback
    homePage = null;
  }

  // Filter active sections and sort by sortOrder ascending
  const rawSections: CustomPageSection[] = homePage?.sections || [];
  const activeSections = rawSections
    .filter((sec) => {
      const content = sec.content as any;
      return content?.isActive !== false;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Helper to render section based on type
  const renderSection = (sec: CustomPageSection, index: number) => {
    const content = (sec.content as any) || {};
    const secType = (content.type || sec.subtitle || "").toLowerCase();
    const key = sec.id || `home-sec-${index}`;

    if (secType.includes("hero")) {
      return (
        <HeroSection
          key={key}
          title={sec.title}
          subtitle={sec.subtitle}
          description={sec.description}
          imageUrl={sec.imageUrl}
          buttonText={sec.buttonText}
          buttonLink={sec.buttonLink}
          content={content}
          useCmsFallback={false}
        />
      );
    }

    if (secType.includes("product")) {
      return (
        <HomeProductsSection
          key={key}
          title={sec.title || "New Arrivals & Featured Collection"}
          subtitle={sec.subtitle || "Curated Selection"}
          description={sec.description}
          buttonText={sec.buttonText || "View All Products"}
          buttonLink={sec.buttonLink || "/shop"}
          limit={content.limit || 8}
        />
      );
    }

    if (secType.includes("feature")) {
      // Feature cards live on /pages/features (Custom Pages Builder), never on home.
      return null;
    }

    if (secType.includes("about")) {
      return (
        <AboutSection
          key={key}
          title={sec.title}
          subtitle={sec.subtitle}
          description={sec.description}
          imageUrl={sec.imageUrl}
          buttonText={sec.buttonText}
          buttonLink={sec.buttonLink}
          content={content}
          useCmsFallback={false}
        />
      );
    }

    if (secType.includes("team")) {
      // Team lives on /pages/team (Custom Pages Builder), never on home.
      return null;
    }

    if (secType.includes("founder")) {
      // Founder profile/blogs/videos live on /pages/founder, never on home.
      return null;
    }

    // Default: Custom Promotional Banner
    return (
      <HomeCustomBanner
        key={key}
        title={sec.title}
        subtitle={sec.subtitle}
        description={sec.description}
        imageUrl={sec.imageUrl}
        buttonText={sec.buttonText}
        buttonLink={sec.buttonLink}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Navbar />

      <main className="flex-1">
        {/* Home page content comes exclusively from the Homepage Customizer */}
        {activeSections.length > 0 &&
          activeSections.map((sec, idx) => {
            const secContent = (sec.content as any) || {};
            const secType = String(secContent.type || sec.subtitle || "").toLowerCase();
            return (
              <ScrollReveal
                key={sec.id || `home-sec-${idx}`}
                variant={resolveRevealVariant(secType, secContent)}
                delay={(idx % 3) * 90}
              >
                {renderSection(sec, idx)}
              </ScrollReveal>
            );
          })}
      </main>

      <Footer />
    </div>
  );
}
