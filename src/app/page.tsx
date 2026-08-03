import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import HeroSection from "@/components/public/HeroSection";
import AboutSection from "@/components/public/AboutSection";
import FeatureGrid from "@/components/public/FeatureGrid";
import FounderSection from "@/components/public/FounderSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Navbar />

      {/* Dynamic Hero Banner from /cms/hero */}
      <HeroSection />

      {/* Dynamic Feature Cards Grid from /cms/section */}
      <FeatureGrid />

      {/* Dynamic About Section from /cms/about */}
      <AboutSection />

      {/* Dynamic Founder Spotlight, Blogs & Videos from /cms/founder */}
      <FounderSection />

      {/* Dynamic Footer with Contact & Social Media from /cms/contact & /cms/social-media */}
      <Footer />
    </div>
  );
}
