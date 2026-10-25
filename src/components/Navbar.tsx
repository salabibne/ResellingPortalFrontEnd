"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  ShoppingCart,
  ChevronDown,
  Menu,
  X,
  User,
  Search,
  LogOut,
  SlidersHorizontal,
  Phone,
  Mail,
} from "lucide-react";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useCMSStore } from "@/store/useCMSStore";
import BrandLogo from "@/components/shared/BrandLogo";
import CartDrawer from "./CartDrawer";

function NavbarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { categories, fetchCategories, setSelectedCategory, setSelectedSubcategory } =
    useCategoryStore();
  const { cart, toggleCart, fetchCart } = useCartStore();
  const { user, logout } = useAuthStore();
  const contactInfo = useCMSStore((state) => state.contactInfo);

  const activeCategoryId = searchParams.get("categoryId");
  const activeSubcategoryId = searchParams.get("subcategoryId");

  useEffect(() => {
    fetchCategories();
    fetchCart();
  }, [fetchCategories, fetchCart]);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock background scroll and support Escape while the drawer is open.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

  const cartItemCount = cart?.cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleCategoryClick = (categoryId: string, subcategoryId?: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subcategoryId || null);

    const queryParams = new URLSearchParams();
    queryParams.set("categoryId", categoryId);
    if (subcategoryId) {
      queryParams.set("subcategoryId", subcategoryId);
    }
    router.push(`/shop?${queryParams.toString()}`);
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const showContactBanner = Boolean(contactInfo && (contactInfo.phone || contactInfo.email));

  return (
    <>
      {/*
        Banner + nav share one sticky wrapper so the bar can never be pushed
        down by a sibling. The banner is desktop-only: on mobile the CMS data
        arriving after hydration used to shift the navbar downward.
      */}
      <div className="sticky top-0 z-40">
        {showContactBanner && contactInfo && (
          <div className="hidden md:block bg-[#001266] text-white/90 text-xs py-1.5 px-3 sm:px-4 border-b border-white/10">
            <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-x-4 gap-y-1">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                {contactInfo.phone && (
                  <a
                    href={`tel:${contactInfo.phone}`}
                    className="flex items-center gap-1.5 hover:text-white transition-colors text-[11px] sm:text-xs"
                  >
                    <Phone size={12} className="text-secondary shrink-0" />
                    <span>{contactInfo.phone}</span>
                  </a>
                )}
                {contactInfo.email && (
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="flex items-center gap-1.5 hover:text-white transition-colors text-[11px] sm:text-xs"
                  >
                    <Mail size={12} className="text-secondary shrink-0" />
                    <span>{contactInfo.email}</span>
                  </a>
                )}
              </div>
              <div className="text-[10px] sm:text-[11px] text-white/70">
                Welcome to <span className="font-semibold text-white">Aarham Apparel</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#001C94] text-white shadow-lg border-b border-primary-content/10">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
            <div className="flex flex-nowrap items-center justify-between h-16 gap-2 sm:gap-4">
              {/* Left: mobile menu toggle + brand */}
              <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
                <button
                  type="button"
                  className="btn btn-ghost btn-square btn-sm shrink-0 text-white hover:bg-white/10 lg:hidden"
                  onClick={() => setMobileMenuOpen((open) => !open)}
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                <Link href="/" className="group flex min-w-0 items-center gap-2">
                  <BrandLogo
                    className="h-8 sm:h-11 w-auto max-w-[40vw] sm:max-w-[45vw] object-contain shrink-0"
                    alt="Aarham Apparel"
                  >
                    <div className="bg-white text-primary p-1.5 sm:p-2 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                      <ShoppingBag size={18} className="stroke-[2.5] sm:hidden" />
                      <ShoppingBag size={20} className="stroke-[2.5] hidden sm:block" />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-extrabold text-base sm:text-xl tracking-tight leading-none text-white">
                        Aarham
                      </span>
                      <span className="truncate text-[9px] sm:text-[10px] tracking-widest text-white/80 uppercase font-semibold">
                        Apparel
                      </span>
                    </div>
                  </BrandLogo>
                </Link>
              </div>

              {/* Middle: desktop category nav */}
              <nav className="hidden lg:flex items-center space-x-1 font-medium text-sm">
                <Link
                  href="/shop"
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedSubcategory(null);
                  }}
                  className={`px-3.5 py-2 rounded-lg transition-colors hover:bg-white/10 ${
                    !activeCategoryId ? "bg-white/15 font-semibold text-white" : "text-white/90"
                  }`}
                >
                  All Products
                </Link>

                {categories.map((category) => {
                  const hasSub = category.subcategories && category.subcategories.length > 0;
                  const isActiveCat = activeCategoryId === category.id;

                  if (!hasSub) {
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategoryClick(category.id)}
                        className={`px-3.5 py-2 rounded-lg transition-colors hover:bg-white/10 ${
                          isActiveCat ? "bg-white/20 font-bold text-white" : "text-white/90"
                        }`}
                      >
                        {category.name}
                      </button>
                    );
                  }

                  return (
                    <div key={category.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => handleCategoryClick(category.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors hover:bg-white/10 ${
                          isActiveCat ? "bg-white/20 font-bold text-white" : "text-white/90"
                        }`}
                      >
                        {category.name}
                        <ChevronDown
                          size={14}
                          className="opacity-70 group-hover:rotate-180 transition-transform"
                        />
                      </button>

                      <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 p-2 min-w-[200px] space-y-1">
                          <button
                            type="button"
                            onClick={() => handleCategoryClick(category.id)}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors border-b border-gray-100"
                          >
                            All in {category.name}
                          </button>
                          {category.subcategories?.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => handleCategoryClick(category.id, sub.id)}
                              className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors hover:bg-gray-100 flex items-center justify-between ${
                                activeSubcategoryId === sub.id
                                  ? "bg-primary/10 text-primary font-bold"
                                  : "text-gray-700"
                              }`}
                            >
                              <span>{sub.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </nav>

              {/* Right: search + actions */}
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
                <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
                  <input
                    type="text"
                    placeholder="Search apparel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input input-sm rounded-full bg-white/10 text-white placeholder-white/60 focus:bg-white focus:text-gray-900 focus:outline-none pl-9 pr-4 w-40 lg:w-56 transition-all"
                    aria-label="Search products"
                  />
                  <Search
                    size={14}
                    className="absolute left-3 text-white/70 pointer-events-none"
                  />
                </form>

                <button
                  type="button"
                  onClick={toggleCart}
                  className="btn btn-ghost btn-circle btn-sm shrink-0 text-white hover:bg-white/10 relative"
                  aria-label="Shopping cart"
                >
                  <ShoppingCart size={20} />
                  {cartItemCount > 0 && (
                    <span className="badge badge-sm badge-secondary indicator-item absolute -top-1 -right-1 font-bold text-[10px]">
                      {cartItemCount}
                    </span>
                  )}
                </button>

                {user ? (
                  <div className="dropdown dropdown-end shrink-0">
                    <div
                      tabIndex={0}
                      role="button"
                      className="btn btn-ghost btn-circle btn-sm avatar placeholder"
                      aria-label="Account menu"
                    >
                      <div className="bg-white/20 text-white rounded-full w-8 flex items-center justify-center">
                        <User size={16} />
                      </div>
                    </div>
                    <ul
                      tabIndex={0}
                      className="mt-3 z-[50] p-2 shadow-lg menu menu-sm dropdown-content bg-white text-gray-800 rounded-xl w-52 border border-gray-100"
                    >
                      <li className="px-3 py-2 text-xs text-gray-500 font-medium border-b border-gray-100">
                        Logged in as{" "}
                        <span className="font-bold text-gray-900 truncate block">
                          {user.name || user.email}
                        </span>
                      </li>
                      <li>
                        <Link href="/my-orders" className="hover:bg-gray-100 py-2">
                          <ShoppingBag size={14} /> My Orders
                        </Link>
                      </li>
                      {["RESELLER", "ADMIN", "SUPER_ADMIN"].includes(
                        (user?.role || "").toUpperCase(),
                      ) && (
                        <li>
                          <Link
                            href="/reseller"
                            className="hover:bg-primary/10 text-primary font-bold py-2"
                          >
                            <ShoppingBag size={14} /> Reseller Portal
                          </Link>
                        </li>
                      )}
                      {["SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_EXECUTIVE"].includes(
                        user?.role || "",
                      ) && (
                        <li>
                          <Link href="/orders" className="hover:bg-gray-100 py-2">
                            <SlidersHorizontal size={14} /> Admin Dashboard
                          </Link>
                        </li>
                      )}
                      <li>
                        <button
                          type="button"
                          onClick={logout}
                          className="text-error hover:bg-red-50 py-2"
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : (
                  // Hidden below `sm`: the same actions live in the mobile drawer
                  // so the 320–414px row never wraps.
                  <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
                    <Link
                      href="/login"
                      className="btn btn-ghost btn-xs sm:btn-sm text-white hover:bg-white/10 rounded-full px-2.5 sm:px-4 text-xs font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="btn btn-secondary btn-xs sm:btn-sm rounded-full px-2.5 sm:px-4 text-xs font-semibold"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer: a true fixed overlay, never a flow sibling of the nav */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-black/60"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            className="absolute inset-y-0 left-0 flex w-[85vw] max-w-sm flex-col overflow-y-auto bg-[#001777] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="text-sm font-extrabold text-white">Menu</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/10"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 px-4 py-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-sm w-full rounded-xl bg-white/15 text-white placeholder-white/70 focus:bg-white focus:text-gray-900 pl-9 pr-4 text-xs"
                  aria-label="Search products"
                />
                <Search
                  size={14}
                  className="absolute left-3 top-2.5 text-white/70 pointer-events-none"
                />
              </form>

              <div className="grid grid-cols-2 gap-2 border-b border-white/10 pb-3">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-xs bg-white/10 text-white border-none hover:bg-white/20 rounded-lg justify-start"
                >
                  Home
                </Link>
                <Link
                  href="/shop"
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedSubcategory(null);
                    setMobileMenuOpen(false);
                  }}
                  className="btn btn-xs bg-white/10 text-white border-none hover:bg-white/20 rounded-lg justify-start"
                >
                  All Products
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-xs bg-white/10 text-white border-none hover:bg-white/20 rounded-lg justify-start"
                >
                  About Us
                </Link>
                <Link
                  href="/reseller"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-xs bg-secondary text-primary border-none hover:bg-secondary/90 rounded-lg justify-start font-bold"
                >
                  Reseller Hub
                </Link>
              </div>

              {!user && (
                <div className="grid grid-cols-2 gap-2 border-b border-white/10 pb-3 sm:hidden">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-xs bg-white/10 text-white border-none hover:bg-white/20 rounded-lg justify-start"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-xs bg-secondary text-primary border-none hover:bg-secondary/90 rounded-lg justify-start font-bold"
                  >
                    Register
                  </Link>
                </div>
              )}

              <div className="space-y-1">
                <div className="text-[11px] font-bold text-white/60 uppercase tracking-wider px-1 pb-1">
                  Product Categories
                </div>
                {categories.map((category) => {
                  const isActiveCat = activeCategoryId === category.id;
                  return (
                    <div key={category.id} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => handleCategoryClick(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                          isActiveCat ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10"
                        }`}
                      >
                        <span>{category.name}</span>
                        {category.subcategories && category.subcategories.length > 0 && (
                          <span className="text-[10px] opacity-70 bg-white/15 px-1.5 py-0.5 rounded">
                            {category.subcategories.length}
                          </span>
                        )}
                      </button>

                      {category.subcategories && category.subcategories.length > 0 && (
                        <div className="pl-3 space-y-1 border-l-2 border-white/20 ml-2">
                          {category.subcategories.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => handleCategoryClick(category.id, sub.id)}
                              className={`w-full text-left px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                                activeSubcategoryId === sub.id
                                  ? "bg-white/30 text-white font-bold"
                                  : "text-white/70 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Cart Drawer */}
      <CartDrawer />
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<div className="h-16 bg-[#001C94]" />}>
      <NavbarContent />
    </Suspense>
  );
}
