import React from "react";
import HeroSection from "@/components/public/HeroSection";
import AboutSection from "@/components/public/AboutSection";
import FeatureGrid from "@/components/public/FeatureGrid";
import TeamSection from "@/components/public/TeamSection";
import FounderSection from "@/components/public/FounderSection";
import HomeProductsSection from "@/components/public/HomeProductsSection";
import HomepageRenderer from "@/components/homepage/HomepageRenderer";
import homepageApi from "@/services/homepage.api";
import type { HomepageConfig } from "@/components/homepage/types";

export const revalidate = 30; // ISR cache revalidation every 30 seconds

/**
 * Last-resort layout used only when the homepage API is unreachable or has no
 * published sections. Keeps the storefront from ever rendering blank.
 */
function LegacyHomeFallback() {
  return (
    <>
      <HeroSection />
      <HomeProductsSection />
      <FeatureGrid />
      <AboutSection />
      <TeamSection />
      <FounderSection />
    </>
  );
}

export default async function Home() {
  let config: HomepageConfig | null = null;

  try {
    config = await homepageApi.getPublic();
  } catch {
    config = null;
  }

  const hasSections = Boolean(config?.sections?.length);

  return config && hasSections ? (
    <HomepageRenderer config={config} />
  ) : (
    <LegacyHomeFallback />
  );
}
