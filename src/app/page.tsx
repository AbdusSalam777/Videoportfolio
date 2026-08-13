import Link from "next/link";
import ReelHero from "@/components/ReelHero";
import HoverVideoCard from "@/components/HoverVideoCard";
import { getFeatured } from "@/lib/store";
import { readProfile } from "@/lib/profile-store";
import { initialsAvatar } from "@/lib/avatar";

export const dynamic = "force-dynamic";

// Placeholder photography (free-to-use, Unsplash) — swap for your own work stills via /admin.
const SERVICES = [
  {
    title: "Commercial & Brand",
    desc: "Fast-paced cuts for ads, product launches, and social campaigns.",
    img: "https://images.unsplash.com/photo-1533928298208-27ff66555d8d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Music Video",
    desc: "Performance and narrative edits, built around the track.",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "YouTube & Long-form",
    desc: "Retention-focused pacing for weekly creator content.",
    img: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?q=80&w=1200&auto=format&fit=crop",
  },
];

const PROCESS = [
  { step: "01", title: "Brief", desc: "You send raw footage, references, and the goal." },
  { step: "02", title: "Edit", desc: "First cut within days — pacing, sound, and story first." },
  { step: "03", title: "Revise", desc: "Two rounds of revisions included on every project." },
  { step: "04", title: "Deliver", desc: "Final export in every format you need — 16:9, 9:16, 1:1." },
];

export default async function Home() {
  const [featured, profile] = await Promise.all([getFeatured(), readProfile()]);
  const hero = featured[0];
  const avatar = profile.avatarPath || initialsAvatar(profile.name);

  return (
    <>
      <ReelHero
        videoSrc={hero?.videoPath}
        posterSrc={hero?.posterPath}
        name={profile.tagline}
        tagline="Commercials, music videos, and short-form content that keeps people watching to the end."
      />

      <section className="border-t border-neutral-800 px-6 py-16 md:px-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
          <img
            src={avatar}
            alt={profile.name}
            className="h-24 w-24 shrink-0 rounded-full object-cover"
          />
          <div>
            <h2 className="font-heading text-xl text-white">{profile.name}</h2>
            <p className="mt-2 text-neutral-400">{profile.bio}</p>
            <Link
              href="/about"
              className="mt-3 inline-block text-sm text-neutral-300 underline hover:text-white"
            >
              More about me →
            </Link>
          </div>
        </div>

        {profile.tools.length > 0 && (
          <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2 sm:justify-start">
            {profile.tools.map((t) => (
              <span
                key={t}
                className="rounded-full border border-neutral-800 px-3 py-1 text-sm text-neutral-400"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-neutral-800 px-6 py-20 md:px-12">
        <h2 className="mb-8 font-heading text-2xl text-white md:text-3xl">
          What I edit
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.title} className="overflow-hidden rounded-lg bg-neutral-900">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-white">{s.title}</h3>
                <p className="mt-1 text-sm text-neutral-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-800 px-6 py-20 md:px-12">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-heading text-2xl text-white md:text-3xl">
            Selected work
          </h2>
          <Link
            href="/work"
            className="text-sm text-neutral-400 hover:text-white"
          >
            View all →
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-neutral-500">
            No projects uploaded yet — add one from{" "}
            <Link href="/admin" className="underline hover:text-white">
              the admin panel
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <HoverVideoCard key={p.slug} project={p} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-neutral-800 px-6 py-20 md:px-12">
        <h2 className="mb-10 font-heading text-2xl text-white md:text-3xl">
          How it works
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((p) => (
            <div key={p.step}>
              <p className="font-heading text-3xl text-neutral-700">{p.step}</p>
              <h3 className="mt-2 font-medium text-white">{p.title}</h3>
              <p className="mt-1 text-sm text-neutral-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {profile.gallery.length > 0 && (
        <section className="border-t border-neutral-800 px-6 py-20 md:px-12">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-heading text-2xl text-white md:text-3xl">
              Behind the scenes
            </h2>
            <Link
              href="/about"
              className="text-sm text-neutral-400 hover:text-white"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {profile.gallery.slice(0, 8).map((img) => (
              <img
                key={img.id}
                src={img.path}
                alt={img.caption || "Editing process"}
                loading="lazy"
                className="aspect-square w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-neutral-800 px-6 py-20 md:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-2xl text-white md:text-3xl">
            Have a project in mind?
          </h2>
          <p className="mt-3 text-neutral-400">
            I take on a limited number of projects each month. Get in touch
            and I&apos;ll reply within a day.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.03]"
          >
            Book a call
          </Link>
        </div>
      </section>
    </>
  );
}
