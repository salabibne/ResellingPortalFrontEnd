"use client";

import { usePathname } from "next/navigation";

/**
 * Returns the longest href that matches the current pathname, so exactly one
 * nav item is highlighted at a time. Trailing slashes and query strings are
 * ignored.
 */
export function useActiveNav(hrefs: string[]): string | null {
  const pathname = usePathname() || "/";
  const current = pathname.replace(/\/+$/, "") || "/";

  let best: string | null = null;
  let bestLength = -1;

  for (const href of hrefs) {
    const target = href.replace(/\/+$/, "") || "/";
    const matches = current === target || current.startsWith(target + "/");
    if (matches && target.length > bestLength) {
      best = href;
      bestLength = target.length;
    }
  }

  return best;
}
