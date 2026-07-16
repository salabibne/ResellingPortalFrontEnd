import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Navbar />

      {/* Hero Section */}
      <div className="hero flex-1 bg-base-200 relative overflow-hidden">
        <div className="hero-content flex-col lg:flex-row-reverse w-full py-16 px-4 md:px-8 gap-10">
          <div className="flex-1 w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-2xl relative">
             <img src="/api/image?name=hero" alt="Hero Fashion" className="w-full h-auto object-cover rounded-2xl" />
          </div>
          <div className="flex-1 text-left">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-base-content mb-6">
              Style Meets <span className="text-primary">Substance</span>
            </h1>
            <p className="py-6 text-lg md:text-xl text-base-content/80 mb-8 leading-relaxed">
              Discover the latest trends in apparel. Our exclusive collection brings you the finest quality clothing designed for comfort and elegance. Elevate your everyday look with Aarham Apparel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn btn-primary btn-lg gap-2 rounded-full px-8">
                Shop Collection <ChevronRight size={20} />
              </button>
              <button className="btn btn-outline btn-lg rounded-full px-8">
                Explore Categories
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Category */}
      <div className="py-20 px-4 md:px-8 bg-base-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-4">New Arrivals</h2>
            <p className="text-base-content/70 mb-6">Minimalistic, premium, and designed for every day. Browse our latest pieces that guarantee a fresh aesthetic.</p>
            <button className="btn btn-secondary rounded-full px-8">View Collection</button>
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden shadow-xl">
             <img src="/api/image?name=category" alt="New Arrivals" className="w-full h-auto object-cover" />
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
