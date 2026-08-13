import type { Metadata } from "next";
import WorkGrid from "@/components/WorkGrid";
import { readProjects } from "@/lib/store";

export const metadata: Metadata = {
  title: "Work — Your Name",
};

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const projects = await readProjects();

  return (
    <div className="px-6 pt-32 pb-20 md:px-12">
      <h1 className="font-heading text-3xl text-white md:text-4xl">Work</h1>
      <p className="mt-2 max-w-xl text-neutral-400">
        A selection of commercials, music videos, and short-form content.
      </p>
      <div className="mt-10">
        <WorkGrid projects={projects} />
      </div>
    </div>
  );
}
