"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, Phone, Mail, MapPin, Send, MessageSquare, Facebook, Share2 } from "lucide-react";
import { useCMSStore } from "@/store/useCMSStore";

export default function Footer() {
  const contact = useCMSStore((state) => state.contactInfo);
  const socials = useCMSStore((state) => state.socialMedia);

  return (
    <footer className="bg-base-200 text-base-content mt-auto border-t border-base-300">
      <div className="footer p-10 max-w-7xl mx-auto">
        <aside className="max-w-xs">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold mb-3 text-black">
            <ShoppingBag className="text-primary" size={28} />
            Aarham Apparel
          </Link>
          <p className="text-sm text-base-content/70 leading-relaxed mb-4">
            Aarham Apparel Ltd.
            <br />
            Providing premium quality clothing and modern fashion.
          </p>

          {/* Social Media Links from CMS */}
          {socials.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {socials.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className="badge badge-outline gap-1.5 p-3 text-xs hover:badge-primary cursor-pointer transition-colors"
                >
                  <Share2 size={12} />
                  <span>{s.name}</span>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Dynamic Contact Info from CMS */}
        <nav>
          <h6 className="footer-title text-black">Contact Us</h6>
          {contact ? (
            <div className="flex flex-col gap-2.5 text-sm text-base-content/80">
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-2 hover:text-primary">
                  <Phone size={16} className="text-primary shrink-0" />
                  <span>{contact.phone}</span>
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-primary">
                  <Mail size={16} className="text-primary shrink-0" />
                  <span>{contact.email}</span>
                </a>
              )}
              {contact.address && (
                <div className="flex items-start gap-2 max-w-xs">
                  <MapPin size={16} className="text-primary shrink-0 mt-1" />
                  <span>{contact.address}</span>
                </div>
              )}
              {contact.whatsapp && (
                <a href={contact.whatsapp.startsWith("http") ? contact.whatsapp : `https://wa.me/${contact.whatsapp.replace(/\+/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary">
                  <MessageSquare size={16} className="text-primary shrink-0" />
                  <span>WhatsApp</span>
                </a>
              )}
              {contact.telegram && (
                <a href={contact.telegram.startsWith("http") ? contact.telegram : `https://t.me/${contact.telegram}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary">
                  <Send size={16} className="text-primary shrink-0" />
                  <span>Telegram</span>
                </a>
              )}
              {contact.facebook && (
                <a href={contact.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary">
                  <Facebook size={16} className="text-primary shrink-0" />
                  <span>Facebook</span>
                </a>
              )}
            </div>
          ) : (
            <div className="text-sm text-base-content/70">
              <p>Phone: +8801700000000</p>
              <p>Email: support@aarhamapparel.com</p>
            </div>
          )}
        </nav>

        <nav>
          <h6 className="footer-title text-black">Company</h6>
          <Link href="/about" className="link link-hover">About Us</Link>
          <Link href="/shop" className="link link-hover">Shop Collection</Link>
          <Link href="/checkout" className="link link-hover">Checkout</Link>
          <Link href="/cms" className="link link-hover">CMS Admin</Link>
        </nav>

        <nav>
          <h6 className="footer-title text-black">Legal</h6>
          <Link href="#" className="link link-hover">Terms of use</Link>
          <Link href="#" className="link link-hover">Privacy policy</Link>
          <Link href="#" className="link link-hover">Cookie policy</Link>
        </nav>
      </div>

      <div className="border-t border-base-300 py-4 px-10 text-center text-xs text-base-content/60">
        &copy; {new Date().getFullYear()} Aarham Apparel Ltd. All rights reserved.
      </div>
    </footer>
  );
}
