/**
 * Basic HTML sanitizer to strip dangerous tags (e.g. script, iframe, onload handlers)
 * before rendering dynamic HTML in dangerouslySetInnerHTML.
 */
export function sanitizeHtml(htmlString: string): string {
  if (!htmlString) return "";
  
  if (typeof window === "undefined") {
    // Server-side simple strip of dangerous elements
    return htmlString
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/javascript:/gi, "");
  }

  // Client-side DOM parsing and sanitization
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  // Remove script tags, iframes, inline event handlers
  const scripts = doc.querySelectorAll("script, iframe, object, embed");
  scripts.forEach((el) => el.remove());

  const allElements = doc.querySelectorAll("*");
  allElements.forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith("on") || attr.value.trim().toLowerCase().startsWith("javascript:")) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return doc.body.innerHTML;
}
