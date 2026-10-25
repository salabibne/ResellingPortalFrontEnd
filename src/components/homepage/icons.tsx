import type { LucideIcon } from "lucide-react";
import {
  Award,
  CheckCircle2,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Zap,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Award,
  CheckCircle2,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Zap,
};

export function TrustIcon({ name, size = 22 }: { name?: string; size?: number }) {
  const Icon = ICONS[name || "CheckCircle2"] || CheckCircle2;
  return <Icon size={size} />;
}

export const TRUST_ICON_NAMES = Object.keys(ICONS);
