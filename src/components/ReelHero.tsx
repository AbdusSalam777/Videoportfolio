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
  const isVertical = Boolean(width && height && height > width);

  // Portrait clips get their own column beside the copy. Overlaying text on a
  // 9:16 video means darkening the very frames the reel is meant to show off.
  if (videoSrc && isVertical) {
    return (
      <section className="relative w-full overflow-hidden border-b border-neutral-800 bg-neutral-950 px-6 pt-28 pb-16 md:px-12 md:pt-32 md:pb-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div>
            <h1 className="font-heading text-4xl leading-[1.05] text-white sm:text-5xl md:text-6xl">
              {name}
            </h1>
            <p className="mt-5 max-w-lg text-base text-neutral-400 md:text-lg">
              {tagline}
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[300px] lg:mx-0 lg:max-w-[340px]">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={posterSrc}
              className="w-full rounded-2xl border border-neutral-800 shadow-2xl shadow-black/50"
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          </div>
        </div>
      </section>
    );
  }

  // Landscape (or no video yet): full-bleed banner with the copy over it.
  return (
    <section className="relative h-[85vh] min-h-[520px] w-full overflow-hidden bg-neutral-950">
      {videoSrc ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterSrc}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        <img
          src={FALLBACK_BG}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-16 md:px-12 md:pb-20">
        <h1 className="max-w-3xl font-heading text-4xl leading-[1.05] text-white sm:text-6xl md:text-7xl">
          {name}
        </h1>
        <p className="mt-4 max-w-xl text-base text-neutral-200 md:text-lg">
          {tagline}
        </p>
      </div>
    </section>
  );
}
