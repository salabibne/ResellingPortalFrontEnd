/** Empty or "#" links make a CTA look broken — treat them as unset. */
export const safeLink = (value?: string | null, fallback = "/shop"): string => {
  const link = (value || "").trim();
  return !link || link === "#" ? fallback : link;
};
