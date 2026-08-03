import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import CMSInitializer from "@/components/CMSInitializer";

const comfortaa = Comfortaa({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aarham Apparel | Modern Fashion & Premium Clothing",
  description: "Explore the finest collection of apparel and modern fashion at Aarham Apparel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="corporate">
      <body className={comfortaa.className}>
        <CMSInitializer />
        {children}
      </body>
    </html>
  );
}
