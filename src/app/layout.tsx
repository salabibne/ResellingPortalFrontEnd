import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import CMSInitializer from "@/components/CMSInitializer";
import NoticePopupModal from "@/components/shared/NoticePopupModal";

const comfortaa = Comfortaa({ subsets: ["latin"] });

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
      <body className={comfortaa.className}>
        <CMSInitializer />
        {children}
        <NoticePopupModal audience="PUBLIC" />
      </body>
    </html>
  );
}
