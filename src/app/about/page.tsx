import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import AboutSection from "@/components/public/AboutSection";
import FounderSection from "@/components/public/FounderSection";
import FeatureGrid from "@/components/public/FeatureGrid";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Navbar />

      <div className="bg-primary/10 py-12 px-4 text-center border-b border-primary/20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-base-content mb-2">
          About Aarham Apparel
        </h1>
        <p className="text-base-content/70 max-w-2xl mx-auto text-base">
          Our vision, story, leadership, and core values.
        </p>
      </div>

      <AboutSection />
      <FounderSection />
      <FeatureGrid />

      <Footer />
    </div>
  );
}
