"use client";

import React from "react";
import { Play, BookOpen, Quote } from "lucide-react";
import { useCMSStore } from "@/store/useCMSStore";

function getYouTubeEmbedUrl(url: string): string {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
}

export default function FounderSection() {
  const profile = useCMSStore((state) => state.founderProfile);
  const blogs = useCMSStore((state) => state.founderBlogs);
  const videos = useCMSStore((state) => state.founderVideos);
  const loading = useCMSStore((state) => state.loading && !state.initialized);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <span className="loading loading-spinner loading-md text-primary"></span>
      </div>
    );
  }

  if (!profile && blogs.length === 0 && videos.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 md:px-8 bg-base-100 border-t border-base-200">
      <div className="max-w-7xl mx-auto flex flex-col gap-12 sm:gap-16">
        {/* Founder Profile & Vision Statement */}
        {profile && (
          <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-10 lg:gap-12 bg-base-200/50 p-5 sm:p-8 md:p-12 rounded-3xl border border-base-300">
            <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-2xl border-4 border-primary/20 shrink-0">
              <img
                src={profile.imageUrl || "/api/image?name=founder"}
                alt={profile.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80";
                }}
              />
            </div>
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-primary mb-3">
                <Quote size={24} className="rotate-180 opacity-80" />
                <span className="badge badge-primary badge-outline text-xs uppercase font-semibold">
                  Founder Spotlight
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-base-content mb-3 sm:mb-4">
                {profile.title}
              </h2>
              <p className="text-base-content/80 text-sm sm:text-base md:text-lg italic leading-relaxed whitespace-pre-line">
                &ldquo;{profile.description}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Founder Blogs Showcase */}
        {blogs.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="text-primary" size={24} />
              <h3 className="text-2xl md:text-3xl font-bold text-base-content">
                Founder Insights & Articles
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, idx) => (
                <div
                  key={blog.id || idx}
                  className="bg-base-100 rounded-2xl border border-base-300 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="h-48 w-full overflow-hidden bg-base-200">
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h4 className="text-xl font-bold text-base-content mb-3 line-clamp-2">
                      {blog.title}
                    </h4>
                    <p className="text-base-content/70 text-sm leading-relaxed line-clamp-3">
                      {blog.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Founder Videos Showcase */}
        {videos.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Play className="text-primary" size={24} />
              <h3 className="text-2xl md:text-3xl font-bold text-base-content">
                Founder Keynotes & Video Showcase
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {videos.map((vid, idx) => {
                const embedUrl = getYouTubeEmbedUrl(vid.videoLink);
                return (
                  <div
                    key={vid.id || idx}
                    className="bg-base-100 rounded-2xl border border-base-300 overflow-hidden shadow-md p-6 flex flex-col gap-4"
                  >
                    {embedUrl ? (
                      <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
                        <iframe
                          src={embedUrl}
                          title={vid.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <a
                        href={vid.videoLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-primary w-full gap-2"
                      >
                        <Play size={18} /> Watch Video
                      </a>
                    )}
                    <div>
                      <h4 className="text-xl font-bold text-base-content mb-2">{vid.title}</h4>
                      <p className="text-base-content/70 text-sm leading-relaxed">{vid.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
