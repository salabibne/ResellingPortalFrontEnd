import type { SectionRenderProps, VideoItem } from "../types";
import SectionFrame from "../SectionFrame";
import { resolveImageUrl } from "../SafeImage";
import { EmptySection, SectionHeading } from "../primitives";
import { getVideoEmbed } from "@/utils/videoEmbed";

function getVideos(section: SectionRenderProps["section"]): VideoItem[] {
  const list = (section.settings.videos as VideoItem[] | undefined) || [];
  return list.filter((item) => item?.url && getVideoEmbed(item.url));
}

function VideoPlayer({
  item,
  autoplay,
  editing,
}: {
  item: VideoItem;
  autoplay: boolean;
  editing: boolean;
}) {
  const embed = getVideoEmbed(item.url, { autoplay });
  if (!embed) return null;
  const title = item.title || "Video";

  return (
    <figure className="w-full">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-neutral shadow-lg ring-1 ring-base-300/60">
        {embed.kind === "file" ? (
          <video
            src={resolveImageUrl(embed.src)}
            controls
            playsInline
            preload="metadata"
            autoPlay={autoplay}
            muted={autoplay}
            loop={autoplay}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <iframe
            src={embed.src}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full border-0"
          />
        )}
        {/* In the builder the player must not swallow the click that selects the section. */}
        {editing && <div className="absolute inset-0" aria-hidden />}
      </div>
      {item.title && (
        <figcaption className="mt-2 text-center text-sm font-semibold text-base-content/80 break-words">
          {item.title}
        </figcaption>
      )}
    </figure>
  );
}

function Empty({ section }: Pick<SectionRenderProps, "section">) {
  return (
    <SectionFrame section={section}>
      <EmptySection message="Paste a YouTube, Facebook, Vimeo or .mp4 link in the editor." />
    </SectionFrame>
  );
}

/** Variant: single — one large player (extra links stack below). */
export function SingleVideo({ section, mode = "view" }: SectionRenderProps) {
  const videos = getVideos(section);
  if (videos.length === 0) return mode === "edit" ? <Empty section={section} /> : null;
  const autoplay = Boolean(section.settings.autoplay);

  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} className="mb-6 sm:mb-8" />
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        {videos.map((item, index) => (
          <VideoPlayer
            key={`${item.url}-${index}`}
            item={item}
            autoplay={autoplay && index === 0}
            editing={mode === "edit"}
          />
        ))}
      </div>
    </SectionFrame>
  );
}

const VIDEO_GRID: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
};

/** Variant: grid — two or three players side by side. */
export function VideoGrid({ section, mode = "view" }: SectionRenderProps) {
  const videos = getVideos(section);
  if (videos.length === 0) return mode === "edit" ? <Empty section={section} /> : null;
  const autoplay = Boolean(section.settings.autoplay);
  const columns = Math.min(Math.max(Number(section.settings.columns ?? 2), 1), 3);

  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} className="mb-6 sm:mb-8" />
      <div className={`grid gap-4 sm:gap-6 ${VIDEO_GRID[columns]}`}>
        {videos.map((item, index) => (
          <VideoPlayer
            key={`${item.url}-${index}`}
            item={item}
            autoplay={autoplay && index === 0}
            editing={mode === "edit"}
          />
        ))}
      </div>
    </SectionFrame>
  );
}
