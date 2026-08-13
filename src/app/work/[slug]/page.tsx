import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <div className="px-6 pt-32 pb-20 md:px-12">
      <Link href="/work" className="text-sm text-neutral-400 hover:text-white">
        ← Back to work
      </Link>

      <div className="mt-6 aspect-video w-full overflow-hidden rounded-lg bg-neutral-900">
        <video
          controls
          playsInline
          preload="none"
          poster={project.posterPath}
          className="h-full w-full object-cover"
        >
          <source src={project.videoPath} type="video/mp4" />
        </video>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <h1 className="font-heading text-3xl text-white md:text-4xl">
            {project.title}
          </h1>
          <p className="mt-4 text-neutral-300">{project.summary}</p>
        </div>
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-neutral-500">Client</dt>
            <dd className="text-white">{project.client || "—"}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Category</dt>
            <dd className="text-white">{project.category}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Role</dt>
            <dd className="text-white">{project.role || "—"}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Year</dt>
            <dd className="text-white">{project.year}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
