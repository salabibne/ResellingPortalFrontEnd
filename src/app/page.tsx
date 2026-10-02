import React from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import HeroSection from "@/components/public/HeroSection";
import AboutSection from "@/components/public/AboutSection";
import FeatureGrid from "@/components/public/FeatureGrid";
import TeamSection from "@/components/public/TeamSection";
import FounderSection from "@/components/public/FounderSection";
import HomeProductsSection from "@/components/public/HomeProductsSection";
import HomeCustomBanner from "@/components/public/HomeCustomBanner";
import customPagesApi, { CustomPage, CustomPageSection } from "@/services/customPages.api";

export const revalidate = 30; // ISR cache revalidation every 30 seconds

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
      return <HeroSection key={key} />;
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
      return <FeatureGrid key={key} />;
    }

    if (secType.includes("about")) {
      return <AboutSection key={key} />;
    }

    if (secType.includes("team")) {
      return <TeamSection key={key} />;
    }

    if (secType.includes("founder")) {
      return <FounderSection key={key} />;
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
        {activeSections.length > 0 ? (
          activeSections.map((sec, idx) => renderSection(sec, idx))
        ) : (
          <>
            {/* Factory Default Fallback Layout */}
            <HeroSection />
            <HomeProductsSection />
            <FeatureGrid />
            <AboutSection />
            <TeamSection />
            <FounderSection />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
