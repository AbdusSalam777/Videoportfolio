import Link from "next/link";
import { readProfile } from "@/lib/profile-store";

export default async function Footer() {
  const profile = await readProfile();

  return (
    <footer className="border-t border-neutral-800 px-6 py-10 md:px-12">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p className="font-heading text-lg text-white">
            {profile.name.toUpperCase()}
          </p>
          <p className="mt-1 text-sm text-neutral-400">{profile.tagline}</p>
        </div>
        <div className="flex gap-6 text-sm text-neutral-400">
          <Link href="/contact" className="hover:text-white">
            Book a call
          </Link>
          <a href={`mailto:${profile.email}`} className="hover:text-white">
            {profile.email}
          </a>
          {profile.instagram && (
            <a
              href={profile.instagram}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              Instagram
            </a>
          )}
        </div>
      </div>
      <p className="mt-8 text-xs text-neutral-600">
        © {new Date().getFullYear()} {profile.name}. All rights reserved.
      </p>
    </footer>
  );
}
