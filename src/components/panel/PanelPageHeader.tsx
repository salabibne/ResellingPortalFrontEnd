import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

interface PanelPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  backHref?: string;
}

export default function PanelPageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  backHref,
}: PanelPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="btn btn-ghost btn-sm btn-square rounded-xl shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </Link>
        )}
        {Icon && (
          <span className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <Icon size={22} />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-base-content/60 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
