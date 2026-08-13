import Link from "next/link";
import ReelHero from "@/components/ReelHero";
import HoverVideoCard from "@/components/HoverVideoCard";
import { getFeatured } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featured = await getFeatured();
  const hero = featured[0];

  return (
    <>
      <ReelHero
        videoSrc={hero?.videoPath}
        posterSrc={hero?.posterPath}
        name="I edit fast-paced video for creators & brands."
        tagline="Commercials, music videos, and short-form content that keeps people watching to the end."
      />

      <section className="px-6 py-20 md:px-12">
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
