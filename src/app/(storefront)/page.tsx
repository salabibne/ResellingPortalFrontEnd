import React from "react";
import HeroSection from "@/components/public/HeroSection";
import AboutSection from "@/components/public/AboutSection";
import HomeProductsSection from "@/components/public/HomeProductsSection";
import HomepageRenderer from "@/components/homepage/HomepageRenderer";
import homepageApi from "@/services/homepage.api";
import type { HomepageConfig } from "@/components/homepage/types";

export const dynamic = "force-dynamic"; // Always fetch the published configuration

/**
 * Last-resort layout used only when the homepage API is unreachable or has no
 * published sections. Feature cards / team / founder stay on /pages/*.
 */
function LegacyHomeFallback() {
  return (
    <>
      <HeroSection />
      <HomeProductsSection />
      <AboutSection />
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

  if (config && config.sections?.length) {
    return <HomepageRenderer config={config} />;
  }

  return <LegacyHomeFallback />;
}
