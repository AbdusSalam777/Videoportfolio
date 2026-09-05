import Link from "next/link";
import ReelHero from "@/components/ReelHero";
import WorkGrid from "@/components/WorkGrid";
import Testimonials from "@/components/Testimonials";
import Companies from "@/components/Companies";
import { readProjects } from "@/lib/store";
import { readProfile } from "@/lib/profile-store";
import { initialsAvatar } from "@/lib/avatar";

export const dynamic = "force-dynamic";

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
  const [projects, profile] = await Promise.all([readProjects(), readProfile()]);
  // "Feature on homepage" now just picks which video plays in the hero;
  // every project still shows in the grid below regardless of the flag.
  const hero = projects.find((p) => p.featured) ?? projects[0];
  const avatar = profile.avatarPath || initialsAvatar(profile.name);

  return (
    <>
      <ReelHero
        videoSrc={hero?.videoPath}
        posterSrc={hero?.posterPath}
        width={hero?.width}
        height={hero?.height}
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
          <SectionLabel>Portfolio</SectionLabel>
          <h2 className="mt-3 font-heading text-2xl text-white md:text-4xl">
            My work
          </h2>

          {projects.length === 0 ? (
            <div className="mt-10 rounded-xl border border-dashed border-neutral-800 px-6 py-16 text-center">
              <p className="text-neutral-400">Your work will appear here.</p>
              <p className="mt-1 text-sm text-neutral-600">
                Upload a video from /admin to fill this space.
              </p>
            </div>
          ) : (
            <div className="mt-10">
              <WorkGrid projects={projects} />
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
