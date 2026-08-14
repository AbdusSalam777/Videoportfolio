import HoverVideoCard from "@/components/HoverVideoCard";
import { splitByOrientation } from "@/lib/orientation";
import type { Project } from "@/lib/types";

/**
 * Vertical clips run first, at most three across; landscape follows, at most
 * two across. Both rows centre, so a single item sits in the middle rather
 * than stranded on the left. Widths are fixed rather than fractional so the
 * per-row maximum falls out of the container width instead of needing
 * explicit column counts.
 */
export default function WorkGrid({ projects }: { projects: Project[] }) {
  const { vertical, horizontal } = splitByOrientation(projects);

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-800 px-6 py-16 text-center">
        <p className="text-neutral-400">No projects published yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {vertical.length > 0 && (
        <div className="flex flex-wrap justify-center gap-5">
          {vertical.map((p) => (
            <div
              key={p.slug}
              className="w-[min(100%,300px)] lg:w-[320px]"
            >
              <HoverVideoCard project={p} />
            </div>
          ))}
        </div>
      )}

      {horizontal.length > 0 && (
        <div className="flex flex-wrap justify-center gap-5">
          {horizontal.map((p) => (
            <div
              key={p.slug}
              className="w-full sm:w-[calc(50%-0.625rem)] sm:max-w-[560px]"
            >
              <HoverVideoCard project={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
