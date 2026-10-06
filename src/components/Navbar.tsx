"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import CartDrawer from "./CartDrawer";

function NavbarContent() {
  const router = useRouter();
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
    }
  };

  return (
    <>
      {/* Top Banner Contact Info from CMS */}
      {contactInfo && (contactInfo.phone || contactInfo.email) && (
        <div className="bg-[#001266] text-white/90 text-xs py-1.5 px-3 sm:px-4 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-x-4 gap-y-1">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              {contactInfo.phone && (
                <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors text-[11px] sm:text-xs">
                  <Phone size={12} className="text-secondary shrink-0" />
                  <span>{contactInfo.phone}</span>
                </a>
              )}
              {contactInfo.email && (
                <a href={`mailto:${contactInfo.email}`} className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors text-[11px] sm:text-xs">
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

      <div className="sticky top-0 z-40 bg-[#001C94] text-white shadow-lg border-b border-primary-content/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            {/* Left: Mobile Menu Toggle & Brand */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                className="btn btn-ghost btn-square btn-sm lg:hidden text-white hover:bg-white/10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              <Link href="/" className="flex items-center gap-2 group">
                <div className="bg-white text-primary p-1.5 sm:p-2 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                  <ShoppingBag size={20} className="stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-base sm:text-xl tracking-tight leading-none text-white">
                    Aarham
                  </span>
                  <span className="text-[9px] sm:text-[10px] tracking-widest text-white/80 uppercase font-semibold">
                    Apparel
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle: Horizontal Category Menu (Desktop) */}
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
                      onClick={() => handleCategoryClick(category.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors hover:bg-white/10 ${
                        isActiveCat ? "bg-white/20 font-bold text-white" : "text-white/90"
                      }`}
                    >
                      {category.name}
                      <ChevronDown size={14} className="opacity-70 group-hover:rotate-180 transition-transform" />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 p-2 min-w-[200px] space-y-1">
                        <button
                          onClick={() => handleCategoryClick(category.id)}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors border-b border-gray-100"
                        >
                          All in {category.name}
                        </button>
                        {category.subcategories?.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleCategoryClick(category.id, sub.id)}
                            className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors hover:bg-gray-100 flex items-center justify-between ${
                              activeSubcategoryId === sub.id ? "bg-primary/10 text-primary font-bold" : "text-gray-700"
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

            {/* Search Input & Right Actions */}
            <div className="flex items-center gap-3">
              {/* Quick Search */}
              <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
                <input
                  type="text"
                  placeholder="Search apparel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-sm rounded-full bg-white/10 text-white placeholder-white/60 focus:bg-white focus:text-gray-900 focus:outline-none pl-9 pr-4 w-44 lg:w-56 transition-all"
                />
                <Search size={14} className="absolute left-3 text-white/70 pointer-events-none" />
              </form>

              {/* Cart Drawer Trigger */}
              <button
                onClick={toggleCart}
                className="btn btn-ghost btn-circle btn-sm text-white hover:bg-white/10 relative"
                aria-label="Shopping Cart"
              >
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="badge badge-sm badge-secondary indicator-item absolute -top-1 -right-1 font-bold text-[10px]">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* User Account / Auth */}
              {user ? (
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm avatar placeholder">
                    <div className="bg-white/20 text-white rounded-full w-8 flex items-center justify-center">
                      <User size={16} />
                    </div>
                  </div>
                  <ul
                    tabIndex={0}
                    className="mt-3 z-[50] p-2 shadow-lg menu menu-sm dropdown-content bg-white text-gray-800 rounded-xl w-52 border border-gray-100"
                  >
                    <li className="px-3 py-2 text-xs text-gray-500 font-medium border-b border-gray-100">
                      Logged in as <span className="font-bold text-gray-900">{user.name || user.email}</span>
                    </li>
                    <li>
                      <Link href="/my-orders" className="hover:bg-gray-100 py-2">
                        <ShoppingBag size={14} /> My Orders
                      </Link>
                    </li>
                    {["RESELLER", "ADMIN", "SUPER_ADMIN"].includes((user?.role || "").toUpperCase()) && (
                      <li>
                        <Link href="/reseller" className="hover:bg-primary/10 text-primary font-bold py-2">
                          <ShoppingBag size={14} /> Reseller Portal
                        </Link>
                      </li>
                    )}
                    {["SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_EXECUTIVE"].includes(user?.role || "") && (
                      <li>
                        <Link href="/orders" className="hover:bg-gray-100 py-2">
                          <SlidersHorizontal size={14} /> Admin Dashboard
                        </Link>
                      </li>
                    )}
                    <li>
                      <button onClick={logout} className="text-error hover:bg-red-50 py-2">
                        <LogOut size={14} /> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link href="/login" className="btn btn-ghost btn-xs sm:btn-sm text-white hover:bg-white/10 rounded-full px-2.5 sm:px-4 text-xs font-medium">
                    Login
                  </Link>
                  <Link href="/register" className="btn btn-secondary btn-xs sm:btn-sm rounded-full px-2.5 sm:px-4 text-xs font-semibold">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer Dropdown */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 z-30 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-40 lg:hidden border-t border-white/10 bg-[#001777] px-4 py-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl">
              {/* Search Input for Mobile */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-sm w-full rounded-xl bg-white/15 text-white placeholder-white/70 focus:bg-white focus:text-gray-900 pl-9 pr-4 text-xs"
                />
                <Search size={14} className="absolute left-3 top-2.5 text-white/70 pointer-events-none" />
              </form>

              {/* Quick Navigation Links */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-b border-white/10 pb-3">
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

              <div className="space-y-1">
                <div className="text-[11px] font-bold text-white/60 uppercase tracking-wider px-1 pb-1">
                  Product Categories
                </div>
                {categories.map((category) => {
                  const isActiveCat = activeCategoryId === category.id;
                  return (
                    <div key={category.id} className="space-y-1">
                      <button
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
          </>
        )}
      </div>

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
