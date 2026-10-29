import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import StorefrontBottomNav from "@/components/shared/StorefrontBottomNav";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <Navbar />
      <main className="flex-1 flex flex-col min-w-0">{children}</main>
      <Footer />
      <StorefrontBottomNav />
    </div>
  );
}
