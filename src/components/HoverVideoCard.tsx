"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Project } from "@/lib/types";
import { isVertical } from "@/lib/orientation";

export default function HoverVideoCard({ project }: { project: Project }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const vertical = isVertical(project);

  const handleEnter = () => {
    const v = videoRef.current;
    if (!v) return;
    if (!v.src) v.src = project.previewPath;
    v.play().catch(() => {});
  };

  const handleLeave = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  };

  return (
    <Link
      href={`/work/${project.slug}`}
      // The card matches the video's own aspect ratio, so object-cover fills it
      // exactly — the whole frame shows with nothing cropped and no blurred
      // filler behind it.
      className={`group relative block overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 transition-colors hover:border-neutral-600 ${
        vertical ? "aspect-[9/16]" : "aspect-video"
      }`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <img
        src={project.posterPath}
        alt={project.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0"
      />
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/0 to-black/0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <p className="text-xs uppercase tracking-wide text-neutral-300">
          {project.category}
        </p>
        <p className="font-medium text-white">{project.title}</p>
      </div>
    </Link>
  );
}
