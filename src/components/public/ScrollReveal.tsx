"use client";

import React, { useEffect, useRef, useState } from "react";

export type RevealVariant =
  | "default"
  | "none"
  | "fade-up"
  | "slide-left"
  | "slide-right"
  | "zoom-in"
  | "zoom-out";

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
}

/** Starting (hidden) classes per entrance animation. */
const HIDDEN: Record<Exclude<RevealVariant, "none">, string> = {
  default: "opacity-0 translate-y-8",
  "fade-up": "opacity-0 translate-y-10",
  "slide-left": "opacity-0 -translate-x-12",
  "slide-right": "opacity-0 translate-x-12",
  "zoom-in": "opacity-0 scale-90",
  "zoom-out": "opacity-0 scale-110",
};

/** Shown classes every variant settles into. */
const SHOWN = "opacity-100 translate-x-0 translate-y-0 scale-100";


/**
 * Standard e-commerce scroll reveal: the section animates in the first time it
 * enters the viewport, then stays put. Variants cover fade-up, left/right
 * slides and zoom in/out. Honors prefers-reduced-motion.
 */
export default function ScrollReveal({
  children,
  variant = "default",
  delay = 0,
  className = "",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const isNone = variant === "none";

  useEffect(() => {
    if (isNone) return;

    const node = ref.current;
    if (!node) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isNone]);

  const hiddenClass = HIDDEN[variant as Exclude<RevealVariant, "none">] ?? HIDDEN.default;
  const settled = visible || isNone;

  return (
    <div
      ref={ref}
      className={`${className} overflow-x-clip will-change-transform ${
        isNone ? "" : "transition-all ease-out"
      } ${settled ? (isNone ? "" : SHOWN) : hiddenClass}`}
      style={
        isNone
          ? undefined
          : {
              transitionDuration: "700ms",
              transitionDelay: visible ? `${delay}ms` : "0ms",
            }
      }
    >
      {children}
    </div>
  );
}
