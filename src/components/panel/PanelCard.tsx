import { ReactNode } from "react";

interface PanelCardProps {
  title?: ReactNode;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

export default function PanelCard({
  title,
  actions,
  className = "",
  bodyClassName = "",
  children,
}: PanelCardProps) {
  return (
    <section
      className={`bg-base-100 rounded-2xl border border-base-200 shadow-sm p-4 sm:p-6 ${className}`}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 mb-4">
          {title && (
            <h2 className="text-lg font-bold text-base-content">{title}</h2>
          )}
          {actions && (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
