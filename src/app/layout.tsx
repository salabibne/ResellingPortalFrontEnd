import type { Metadata } from "next";
import { Comfortaa, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import CMSInitializer from "@/components/CMSInitializer";
import NoticePopupModal from "@/components/shared/NoticePopupModal";

const comfortaa = Comfortaa({ subsets: ["latin"], variable: "--font-comfortaa" });
// Comfortaa has no Bengali glyphs; the browser falls back per character to Hind Siliguri.
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bengali",
});

export const metadata: Metadata = {
  title: "Online Uddokta Platform | Start Your Online Business",
  description: "Start your online business with Online Uddokta Platform - source products and resell them at your own selling price.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="corporate">
      <body
        className={`${comfortaa.variable} ${hindSiliguri.variable}`}
        style={{ fontFamily: "var(--font-comfortaa), var(--font-bengali), sans-serif" }}
      >
        <CMSInitializer />
        {children}
        <NoticePopupModal audience="PUBLIC" />
      </body>
    </html>
  );
}
