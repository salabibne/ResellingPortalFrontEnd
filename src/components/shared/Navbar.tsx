"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function Navbar() {
  return (
    <div className="navbar  backdrop-blur-md sticky top-0 z-50 border-b border-base-200 px-4 md:px-8 bg-[#001C94] text-white">
      <div className="navbar-start">
        <Link href="/" className="btn bg-primary text-primary-content hover:bg-primary/90 border-none text-xl font-bold flex gap-2">
          <ShoppingBag className="text-primary-content" />
          Aarham Apparel
        </Link>
      </div>
      
      <div className="navbar-center hidden lg:flex ">
        <ul className="menu menu-horizontal px-1 font-medium gap-2 btn-primary">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/about">About Us</Link></li>
          <li><Link href="/products">Products</Link></li>
        </ul>
      </div>

      <div className="navbar-end gap-2">
        <Link href="/register" className="btn btn-ghost hidden sm:flex">
          Registration
        </Link>
        <Link href="/login" className="btn btn-primary">
          Login
        </Link>
      </div>
    </div>
  );
}
