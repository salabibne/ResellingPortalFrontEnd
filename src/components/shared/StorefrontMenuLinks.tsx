"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCategoryStore } from "@/store/useCategoryStore";

const linkClass =
  "btn btn-sm border-none bg-base-200 text-base-content hover:bg-base-300 rounded-xl justify-start font-medium";
const accentLinkClass =
  "btn btn-sm border-none bg-secondary text-primary hover:bg-secondary/90 rounded-xl justify-start font-bold";

/** Search and page links shown above the categories in the ☰ menu drawer. */
export default function StorefrontMenuLinks({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setSelectedCategory = useCategoryStore((state) => state.setSelectedCategory);
  const setSelectedSubcategory = useCategoryStore((state) => state.setSelectedSubcategory);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    onNavigate();
  };

  return (
    <div className="space-y-3 px-1">
      <form onSubmit={handleSearchSubmit} className="relative" role="search">
        <input
          type="search"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="input input-bordered input-sm w-full rounded-xl pl-9 text-sm"
          aria-label="Search products"
        />
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
        />
      </form>

      <div className="grid grid-cols-2 gap-2">
        <Link href="/" onClick={onNavigate} className={linkClass}>
          Home
        </Link>
        <Link
          href="/shop"
          onClick={() => {
            setSelectedCategory(null);
            setSelectedSubcategory(null);
            onNavigate();
          }}
          className={linkClass}
        >
          All Products
        </Link>
        <Link href="/about" onClick={onNavigate} className={linkClass}>
          About Us
        </Link>
        <Link href="/reseller" onClick={onNavigate} className={accentLinkClass}>
          Uddokta Hub
        </Link>
        {!user && (
          <>
            <Link href="/login" onClick={onNavigate} className={linkClass}>
              Login
            </Link>
            <Link href="/register" onClick={onNavigate} className={accentLinkClass}>
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
