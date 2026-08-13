import type { Metadata } from "next";
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
    <div className="px-6 pt-32 pb-20 md:px-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-4">
          <img
            src={avatar}
            alt={profile.name}
            className="h-20 w-20 rounded-full object-cover"
          />
          <div>
            <h1 className="font-heading text-3xl text-white md:text-4xl">
              {profile.name}
            </h1>
            <p className="text-neutral-400">{profile.tagline}</p>
          </div>
        </div>

        <p className="mt-8 whitespace-pre-line text-neutral-300">
          {profile.bio}
        </p>

        {profile.tools.length > 0 && (
          <>
            <h2 className="mt-10 font-heading text-xl text-white">Tools</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.tools.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-neutral-800 px-3 py-1 text-sm text-neutral-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </>
        )}

        {profile.skills.length > 0 && (
          <>
            <h2 className="mt-10 font-heading text-xl text-white">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-neutral-900 px-3 py-1 text-sm text-neutral-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </>
        )}

        {profile.clients && (
          <>
            <h2 className="mt-10 font-heading text-xl text-white">
              Worked with
            </h2>
            <p className="mt-3 text-neutral-400">{profile.clients}</p>
          </>
        )}
      </div>

      {profile.gallery.length > 0 && (
        <div className="mx-auto mt-16 max-w-5xl">
          <h2 className="mb-4 font-heading text-xl text-white">
            Behind the scenes
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {profile.gallery.map((img) => (
              <figure key={img.id}>
                <img
                  src={img.path}
                  alt={img.caption || "Editing process"}
                  loading="lazy"
                  className="aspect-square w-full rounded-lg object-cover"
                />
                {img.caption && (
                  <figcaption className="mt-1 text-xs text-neutral-500">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
