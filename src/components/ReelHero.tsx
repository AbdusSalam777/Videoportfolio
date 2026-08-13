"use client";

export default function ReelHero({
  videoSrc,
  posterSrc,
  name,
  tagline,
}: {
  videoSrc?: string;
  posterSrc?: string;
  name: string;
  tagline: string;
}) {
  return (
    <section className="relative h-[85vh] min-h-[520px] w-full overflow-hidden bg-neutral-900">
      {videoSrc && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={posterSrc}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-16 md:px-12 md:pb-20">
        <h1 className="max-w-3xl font-heading text-4xl leading-[1.05] text-white sm:text-6xl md:text-7xl">
          {name}
        </h1>
        <p className="mt-4 max-w-xl text-base text-neutral-300 md:text-lg">
          {tagline}
        </p>
      </div>
    </section>
  );
}
