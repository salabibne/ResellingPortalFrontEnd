import { ReactNode } from "react";

interface PanelTableProps {
  children: ReactNode;
  className?: string;
}

/**
 * Consistent table shell. Pass daisyUI table sections
 * (`<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`).
 */
export default function PanelTable({ children, className = "" }: PanelTableProps) {
  return (
    <div
      className={`overflow-x-auto rounded-2xl border border-base-200 bg-base-100 ${className}`}
    >
      <table className="panel-table table table-sm">{children}</table>
    </div>
  );
}
