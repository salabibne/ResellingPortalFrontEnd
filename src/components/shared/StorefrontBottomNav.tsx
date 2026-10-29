"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, ShoppingCart, User } from "lucide-react";
import MobileBottomNav from "@/components/panel/MobileBottomNav";
import { formatWhatsAppUrl, WhatsAppIcon } from "@/components/shared/WhatsAppButton";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { useCMSStore } from "@/store/useCMSStore";
import { useMobileMenuStore } from "@/store/useMobileMenuStore";

const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_EXECUTIVE", "INVENTOR"];

/** Where the account slot points for the signed-in user's role. */
function accountHref(role: string): string {
  if (role === "RESELLER") return "/reseller";
  if (STAFF_ROLES.includes(role)) return "/dashboard";
  return "/my-orders";
}

export default function StorefrontBottomNav() {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((state) => state.user);
  const cart = useCartStore((state) => state.cart);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const contactInfo = useCMSStore((state) => state.contactInfo);
  const menuOpen = useMobileMenuStore((state) => state.open);
  const setMenuOpen = useMobileMenuStore((state) => state.setOpen);

  // Auth is restored from localStorage, so wait for mount to avoid a
  // server/client mismatch on the account slot.
  useEffect(() => {
    setMounted(true);
  }, []);

  const signedIn = mounted && !!user;
  const cartCount = cart?.cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <MobileBottomNav
      homeHref="/"
      items={[
        {
          label: "Category",
          icon: LayoutGrid,
          onClick: () => setMenuOpen(!menuOpen),
          expanded: menuOpen,
        },
        {
          label: "Message",
          icon: WhatsAppIcon,
          href: formatWhatsAppUrl(contactInfo?.whatsapp),
          external: true,
        },
        { label: "Cart", icon: ShoppingCart, onClick: toggleCart, badge: cartCount },
        signedIn
          ? { label: "Account", icon: User, href: accountHref((user?.role || "").toUpperCase()) }
          : { label: "Login", icon: User, href: "/login" },
      ]}
    />
  );
}
