import Link from "next/link";
import ReelHero from "@/components/ReelHero";
import HoverVideoCard from "@/components/HoverVideoCard";
import Testimonials from "@/components/Testimonials";
import Companies from "@/components/Companies";
import { getFeatured } from "@/lib/store";
import { readProfile } from "@/lib/profile-store";
import { initialsAvatar } from "@/lib/avatar";

export const dynamic = "force-dynamic";

// Placeholder photography (free-to-use, Unsplash) — swap for your own work stills.
const SERVICES = [
  {
    title: "Commercial & Brand",
    desc: "Fast-paced cuts for ads, product launches, and social campaigns — delivered in every aspect ratio you need.",
    img: "https://images.unsplash.com/photo-1533928298208-27ff66555d8d?q=80&w=1200&auto=format&fit=crop",
    points: ["16:9, 9:16 & 1:1 exports", "Licensed music sourcing", "Motion titles included"],
  },
  {
    title: "Music Video",
    desc: "Performance and narrative edits built around the track, with a colour grade that matches the mood.",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
    points: ["Beat-matched cutting", "Full colour grade", "Multi-cam sync"],
  },
  {
    title: "YouTube & Long-form",
    desc: "Retention-focused pacing for weekly creator content, with a consistent channel style you can rely on.",
    img: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?q=80&w=1200&auto=format&fit=crop",
    points: ["48hr turnaround", "Hook-first structure", "Thumbnails on request"],
  },
];

const PROCESS = [
  {
    step: "01",
    title: "Brief",
    desc: "You send raw footage, references, and the goal. We agree scope and deadline up front — no surprises later.",
  },
  {
    step: "02",
    title: "First cut",
    desc: "You get a watermarked first cut within days. Structure, pacing, and sound come before polish.",
  },
  {
    step: "03",
    title: "Revisions",
    desc: "Two rounds included on every project, with timestamped comments so nothing gets lost in translation.",
  },
  {
    step: "04",
    title: "Delivery",
    desc: "Final masters in every format you need, plus the project file if you ever want to take it in-house.",
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
      {children}
    </p>
  );
}

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

      <Companies items={profile.companies} />

      {profile.stats.length > 0 && (
        <section className="border-t border-neutral-800 px-6 py-14 md:px-12">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 lg:grid-cols-4">
            {profile.stats.map((s) => (
              <div key={s.label}>
                <p className="font-heading text-4xl text-white md:text-5xl">
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-neutral-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-neutral-800 px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[300px_1fr]">
          <div>
            <img
              src={avatar}
              alt={profile.name}
              className="h-28 w-28 rounded-full object-cover"
            />
            <h2 className="mt-5 font-heading text-2xl text-white">
              {profile.name}
            </h2>
            <p className="mt-1 text-neutral-500">Video editor</p>
            <Link
              href="/contact"
              className="mt-5 inline-block rounded-full border border-neutral-700 px-5 py-2 text-sm text-neutral-200 transition-colors hover:border-white hover:text-white"
            >
              Work with me
            </Link>
          </div>

          <div>
            <SectionLabel>About</SectionLabel>
            <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-neutral-300">
              {profile.bio}
            </p>

            {profile.skills.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-neutral-400">
                  What I&apos;m good at
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-neutral-900 px-3 py-1.5 text-sm text-neutral-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.tools.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-neutral-400">Tools</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.tools.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-neutral-800 px-3 py-1.5 text-sm text-neutral-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-800 px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Services</SectionLabel>
          <h2 className="mt-3 font-heading text-2xl text-white md:text-4xl">
            What I edit
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {SERVICES.map((s) => (
              <article
                key={s.title}
                className="group overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 transition-colors hover:border-neutral-700"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-lg text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                    {s.desc}
                  </p>
                  <ul className="mt-4 space-y-1.5">
                    {s.points.map((p) => (
                      <li
                        key={p}
                        className="flex items-center gap-2 text-sm text-neutral-500"
                      >
                        <span className="h-1 w-1 rounded-full bg-neutral-600" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-800 px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between">
            <div>
              <SectionLabel>Portfolio</SectionLabel>
              <h2 className="mt-3 font-heading text-2xl text-white md:text-4xl">
                Selected work
              </h2>
            </div>
            <Link
              href="/work"
              className="shrink-0 text-sm text-neutral-400 transition-colors hover:text-white"
            >
              View all →
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="mt-10 rounded-xl border border-dashed border-neutral-800 px-6 py-16 text-center">
              <p className="text-neutral-400">
                Your featured projects will appear here.
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                Upload a video and tick &ldquo;Feature on homepage&rdquo; to fill
                this space.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <HoverVideoCard key={p.slug} project={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Testimonials items={profile.testimonials} />

      <section className="border-t border-neutral-800 px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Process</SectionLabel>
          <h2 className="mt-3 font-heading text-2xl text-white md:text-4xl">
            How it works
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p) => (
              <div key={p.step} className="border-t border-neutral-800 pt-5">
                <p className="font-heading text-sm text-neutral-600">{p.step}</p>
                <h3 className="mt-3 font-heading text-lg text-white">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {profile.gallery.length > 0 && (
        <section className="border-t border-neutral-800 px-6 py-20 md:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-end justify-between">
              <div>
                <SectionLabel>Behind the scenes</SectionLabel>
                <h2 className="mt-3 font-heading text-2xl text-white md:text-4xl">
                  In the timeline
                </h2>
              </div>
              <Link
                href="/about"
                className="shrink-0 text-sm text-neutral-400 transition-colors hover:text-white"
              >
                View all →
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
          </div>
        </section>
      )}

      <section className="border-t border-neutral-800 px-6 py-24 md:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl text-white md:text-5xl">
            Have a project in mind?
          </h2>
          <p className="mt-4 text-neutral-400">
            I take on a limited number of projects each month so every edit gets
            proper attention. Tell me what you&apos;re making and I&apos;ll reply
            within a day.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-full bg-white px-7 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.03]"
            >
              Start a project
            </Link>
            <Link
              href="/work"
              className="rounded-full border border-neutral-700 px-7 py-3 text-sm text-neutral-200 transition-colors hover:border-white hover:text-white"
            >
              See the work
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
