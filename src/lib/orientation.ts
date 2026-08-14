import type { Project } from "@/lib/types";

/**
 * Portrait clips (Reels/TikTok/Shorts) are laid out separately from landscape
 * ones. Uploads made before dimensions were recorded have no width/height, so
 * they fall back to landscape — the safer default for an unknown aspect.
 */
export function isVertical(project: Project) {
  return Boolean(
    project.width && project.height && project.height > project.width
  );
}

export function splitByOrientation(projects: Project[]) {
  return {
    vertical: projects.filter(isVertical),
    horizontal: projects.filter((p) => !isVertical(p)),
  };
}
