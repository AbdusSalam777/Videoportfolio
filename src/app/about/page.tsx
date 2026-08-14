import type { Metadata } from "next";
import Link from "next/link";
import Companies from "@/components/Companies";
import Testimonials from "@/components/Testimonials";
import { readProfile } from "@/lib/profile-store";
import { initialsAvatar } from "@/lib/avatar";

export const metadata: Metadata = {
  title: "About — Your Name",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const profile = await readProfile();
  const avatar = profile.avatarPath || initialsAvatar(profile.name);

  return (
    <>
      <div className="px-6 pt-32 pb-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[320px_1fr]">
            <div>
              <img
                src={avatar}
                alt={profile.name}
                className="aspect-square w-full max-w-[320px] rounded-2xl object-cover"
              />
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
                About
              </p>
              <h1 className="mt-3 font-heading text-4xl text-white md:text-5xl">
                {profile.name}
              </h1>
              <p className="mt-3 text-lg text-neutral-400">{profile.tagline}</p>

              <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-neutral-300">
                {profile.bio}
              </p>

              {profile.skills.length > 0 && (
                <div className="mt-10">
                  <h2 className="font-heading text-sm uppercase tracking-wider text-neutral-400">
                    Skills
                  </h2>
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
                <div className="mt-8">
                  <h2 className="font-heading text-sm uppercase tracking-wider text-neutral-400">
                    Tools
                  </h2>
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

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition-transform hover:scale-[1.03]"
                >
                  Start a project
                </Link>
                <Link
                  href="/work"
                  className="rounded-full border border-neutral-700 px-6 py-2.5 text-sm text-neutral-200 transition-colors hover:border-white hover:text-white"
                >
                  See the work
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Companies items={profile.companies} />

      {profile.gallery.length > 0 && (
        <section className="border-t border-neutral-800 px-6 py-20 md:px-12">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
              Behind the scenes
            </p>
            <h2 className="mt-3 font-heading text-2xl text-white md:text-4xl">
              In the timeline
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {profile.gallery.map((img) => (
                <figure key={img.id}>
                  <img
                    src={img.path}
                    alt={img.caption || "Editing process"}
                    loading="lazy"
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  {img.caption && (
                    <figcaption className="mt-2 text-xs text-neutral-500">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <Testimonials items={profile.testimonials} />
    </>
  );
}
