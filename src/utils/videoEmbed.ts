/**
 * Turns a pasted video link into something safe to embed.
 * Supports YouTube (watch, youtu.be, shorts, embed, live), Facebook videos,
 * Vimeo and direct video files (.mp4/.webm/.ogg). Returns null otherwise.
 */
export type VideoEmbed =
  | { kind: "youtube"; src: string; id: string }
  | { kind: "facebook"; src: string }
  | { kind: "vimeo"; src: string }
  | { kind: "file"; src: string };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

function parseUrl(raw: string): URL | null {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

export function getYouTubeId(raw: string): string | null {
  const url = parseUrl(raw.trim());
  if (!url) return null;
  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = url.pathname.slice(1).split("/")[0];
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else {
      const match = url.pathname.match(/^\/(shorts|embed|live)\/([^/?#]+)/);
      if (match) id = match[2];
    }
  }

  return id && YOUTUBE_ID.test(id) ? id : null;
}

export function getVideoEmbed(raw: string, options: { autoplay?: boolean } = {}): VideoEmbed | null {
  const value = (raw || "").trim();
  if (!value) return null;

  const youtubeId = getYouTubeId(value);
  if (youtubeId) {
    const params = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1" });
    if (options.autoplay) {
      params.set("autoplay", "1");
      params.set("mute", "1");
    }
    return {
      kind: "youtube",
      id: youtubeId,
      src: `https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`,
    };
  }

  const url = parseUrl(value);
  const isRelativeFile = value.startsWith("/") && !value.startsWith("//");

  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(isRelativeFile ? value : url?.pathname ?? "")) {
    if (isRelativeFile || url?.protocol === "https:" || url?.protocol === "http:") {
      return { kind: "file", src: value };
    }
  }

  if (!url || url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^(www\.|m\.|web\.)/, "");

  if (host === "facebook.com" || host === "fb.watch") {
    const params = new URLSearchParams({ href: value, show_text: "false" });
    if (options.autoplay) params.set("autoplay", "true");
    return { kind: "facebook", src: `https://www.facebook.com/plugins/video.php?${params.toString()}` };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const match = url.pathname.match(/(\d{6,})/);
    if (!match) return null;
    const params = new URLSearchParams();
    if (options.autoplay) {
      params.set("autoplay", "1");
      params.set("muted", "1");
    }
    const query = params.toString();
    return { kind: "vimeo", src: `https://player.vimeo.com/video/${match[1]}${query ? `?${query}` : ""}` };
  }

  return null;
}
