"use client";

const FALLBACK_BG =
  "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1920&auto=format&fit=crop";

export default function ReelHero({
  videoSrc,
  posterSrc,
  width,
  height,
  name,
  tagline,
}: {
  videoSrc?: string;
  posterSrc?: string;
  width?: number;
  height?: number;
  name: string;
  tagline: string;
}) {
  // Vertical clips (Reels/TikTok/Shorts) must not be cropped to a wide banner —
  // they get shown whole, with a blurred still filling the space behind them.
  const isVertical = Boolean(width && height && height > width);

  return (
    <section className="relative h-[85vh] min-h-[520px] w-full overflow-hidden bg-neutral-950">
      {videoSrc ? (
        <>
          {/* Backdrop: blurred poster, cheap to render and never letterboxed. */}
          {posterSrc && (
            <img
              src={posterSrc}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
            />
          )}
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={posterSrc}
            className={
              isVertical
                ? "relative mx-auto h-full w-auto max-w-full object-contain"
                : "absolute inset-0 h-full w-full object-cover"
            }
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </>
      ) : (
        <img
          src={FALLBACK_BG}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Text sits over a gradient rather than a flat wash, so a vertical
          video stays visible above the copy instead of being dimmed out. */}
      <div
        className={
          isVertical
            ? "pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10"
            : "absolute inset-0 bg-black/60"
        }
      />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end px-6 pb-16 md:px-12 md:pb-20">
        <h1 className="max-w-3xl font-heading text-4xl leading-[1.05] text-white drop-shadow-lg sm:text-6xl md:text-7xl">
          {name}
        </h1>
        <p className="mt-4 max-w-xl text-base text-neutral-200 drop-shadow md:text-lg">
          {tagline}
        </p>
      </div>
    </section>
  );
}
