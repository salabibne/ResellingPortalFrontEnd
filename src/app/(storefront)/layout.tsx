import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import FloatingActions from "@/components/shared/FloatingActions";
import StorefrontBottomNav from "@/components/shared/StorefrontBottomNav";

/**
 * Single storefront chrome for every public route. Route groups keep URLs
 * unchanged while guaranteeing exactly one header/footer per page.
 */
export default function StorefrontLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Navbar />
      <main className="flex-1 min-w-0">{children}</main>
      <Footer />
      <FloatingActions />
      <StorefrontBottomNav />
    </div>
  );
}
