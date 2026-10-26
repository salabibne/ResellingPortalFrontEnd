import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface PanelEmptyProps {
  icon?: LucideIcon;
  title: string;
  text?: string;
  action?: ReactNode;
  className?: string;
}

export default function PanelEmpty({
  icon: Icon,
  title,
  text,
  action,
  className = "",
}: PanelEmptyProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center gap-3 py-12 px-4 ${className}`}
    >
      {Icon && (
        <div className="p-3 rounded-2xl bg-base-200 text-base-content/50">
          <Icon size={28} />
        </div>
      )}
      <h2 className="text-lg font-bold text-base-content">{title}</h2>
      {text && <p className="text-sm text-base-content/60 max-w-sm">{text}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
