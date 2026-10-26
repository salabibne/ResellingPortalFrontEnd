import { ReactNode } from "react";

type PanelPageWidth = "default" | "narrow" | "full";

interface PanelPageProps {
  width?: PanelPageWidth;
  className?: string;
  children: ReactNode;
}

const WIDTHS: Record<PanelPageWidth, string> = {
  default: "w-full max-w-7xl mx-auto",
  narrow: "w-full max-w-3xl mx-auto",
  full: "w-full",
};

export default function PanelPage({
  width = "default",
  className = "",
  children,
}: PanelPageProps) {
  return (
    <div className={`${WIDTHS[width]} flex flex-col gap-6 pb-12 ${className}`}>
      {children}
    </div>
  );
}
