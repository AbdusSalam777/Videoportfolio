import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Your Name",
};

export default function AboutPage() {
  return (
    <div className="px-6 pt-32 pb-20 md:px-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-3xl text-white md:text-4xl">About</h1>
        <p className="mt-6 text-neutral-300">
          I&apos;m a video editor focused on fast-paced, retention-driven
          content for creators and brands — commercials, music videos, and
          short-form cutdowns. Replace this paragraph with your real story:
          how you got into editing, the kind of work you love, and what
          makes your edits distinct.
        </p>

        <h2 className="mt-10 font-heading text-xl text-white">Tools</h2>
        <p className="mt-3 text-neutral-400">
          Premiere Pro, DaVinci Resolve, After Effects, Adobe Audition.
        </p>

        <h2 className="mt-10 font-heading text-xl text-white">
          Worked with
        </h2>
        <p className="mt-3 text-neutral-400">
          List client names or logos here once you have a few — social proof
          converts better than more sample videos.
        </p>
      </div>
    </div>
  );
}
