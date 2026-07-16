import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer p-10 bg-base-200 text-base-content mt-auto border-t border-base-300">
      <aside>
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold mb-4">
          <ShoppingBag className="text-primary" />
          Aarham Apparel
        </Link>
        <p>Aarham Apparel Ltd.<br/>Providing premium quality clothing since 2024</p>
      </aside> 
      <nav>
        <h6 className="footer-title">Services</h6> 
        <Link href="#" className="link link-hover">Branding</Link>
        <Link href="#" className="link link-hover">Design</Link>
        <Link href="#" className="link link-hover">Marketing</Link>
        <Link href="#" className="link link-hover">Advertisement</Link>
      </nav> 
      <nav>
        <h6 className="footer-title">Company</h6> 
        <Link href="/about" className="link link-hover">About Us</Link>
        <Link href="#" className="link link-hover">Contact</Link>
        <Link href="#" className="link link-hover">Jobs</Link>
        <Link href="#" className="link link-hover">Press kit</Link>
      </nav> 
      <nav>
        <h6 className="footer-title">Legal</h6> 
        <Link href="#" className="link link-hover">Terms of use</Link>
        <Link href="#" className="link link-hover">Privacy policy</Link>
        <Link href="#" className="link link-hover">Cookie policy</Link>
      </nav>
    </footer>
  );
}
