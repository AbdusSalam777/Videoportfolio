"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Project } from "@/lib/types";

export default function HoverVideoCard({ project }: { project: Project }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVertical = Boolean(
    project.width && project.height && project.height > project.width
  );
  const fit = isVertical ? "object-contain" : "object-cover";

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
      className="group relative block aspect-video overflow-hidden rounded-lg bg-neutral-900"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Blurred fill behind vertical clips so the card has no empty bars. */}
      {isVertical && (
        <img
          src={project.posterPath}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
        />
      )}
      <img
        src={project.posterPath}
        alt={project.title}
        loading="lazy"
        className={`absolute inset-0 h-full w-full ${fit} transition-opacity duration-300 group-hover:opacity-0`}
      />
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        className={`absolute inset-0 h-full w-full ${fit} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
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
