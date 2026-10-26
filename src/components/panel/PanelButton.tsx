import { ButtonHTMLAttributes, ReactNode } from "react";

export type PanelButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "danger-outline";

interface PanelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PanelButtonVariant;
  size?: "sm" | "xs";
  iconOnly?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

const VARIANTS: Record<PanelButtonVariant, string> = {
  primary: "btn-primary text-white font-semibold",
  secondary: "btn-outline",
  ghost: "btn-ghost",
  danger: "btn-error text-white",
  "danger-outline": "btn-outline btn-error",
};

export default function PanelButton({
  variant = "primary",
  size = "sm",
  iconOnly = false,
  loading = false,
  type = "button",
  className = "",
  disabled,
  children,
  ...rest
}: PanelButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`btn ${VARIANTS[variant]} ${size === "xs" ? "btn-xs" : "btn-sm"} ${
        iconOnly ? "btn-square" : "gap-2"
      } rounded-xl ${className}`}
      {...rest}
    >
      {loading && <span className="loading loading-spinner loading-xs" />}
      {children}
    </button>
  );
}
