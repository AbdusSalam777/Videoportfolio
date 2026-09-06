"use client";

import { useEffect, useRef } from "react";

/**
 * A muted, autoplaying background video with no visible controls — so there
 * is never a legitimate reason for it to pause and just stay paused. It
 * resumes itself whenever that happens: a network stall, the tab getting
 * throttled while backgrounded, or a browser pausing it for its own reasons.
 * Retries are debounced so a genuinely blocked autoplay policy can't spam
 * play() calls forever.
 */
export default function AutoResumeVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const resume = () => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        if (v.paused) v.play().catch(() => {});
      }, 250);
    };

    v.addEventListener("pause", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      if (timer) clearTimeout(timer);
      v.removeEventListener("pause", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, []);

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      className={className}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
