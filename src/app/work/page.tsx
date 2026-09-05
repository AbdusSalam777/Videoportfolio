import type { Metadata } from "next";
import WorkGrid from "@/components/WorkGrid";
import { readProjects } from "@/lib/store";
import { readProfile } from "@/lib/profile-store";

// Rendered via the root layout's title template as "Work — {your name}".
export const metadata: Metadata = { title: "Work" };

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const [projects, profile] = await Promise.all([readProjects(), readProfile()]);

  return (
    <div className="px-6 pt-32 pb-20 md:px-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-heading text-3xl text-white md:text-4xl">Work</h1>
        <p className="mt-2 max-w-xl text-neutral-400">
          A selection of commercials, music videos, and short-form content.
        </p>
        <div className="mt-10">
          <WorkGrid projects={projects} layout={profile.layout} />
        </div>
      </div>
    </div>
  );
}
