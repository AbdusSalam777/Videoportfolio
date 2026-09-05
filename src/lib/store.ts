import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import type { Project } from "@/lib/types";

export type { Category, Project } from "@/lib/types";
export { categories } from "@/lib/types";

// Where the JSON "database" lives. On the VPS, point this outside the git
// checkout (e.g. /var/www/vidportfolio-data) via DATA_DIR so it survives
// deploys. Defaults to ./data for local dev.
const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "projects.json");

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  }
}

async function writeProjects(list: Project[]) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
}

export async function readProjects(): Promise<Project[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  const list: Project[] = JSON.parse(raw);

  // Records saved before manual ordering existed have no `order`. Backfill it
  // once, using their current createdAt-desc position, so every project has
  // an explicit place and future reads don't need this fallback.
  if (list.some((p) => p.order === undefined)) {
    const byRecency = [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    byRecency.forEach((p, i) => {
      p.order = i;
    });
    await writeProjects(list);
  }

  return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getProject(slug: string) {
  const list = await readProjects();
  return list.find((p) => p.slug === slug);
}

export async function getFeatured() {
  const list = await readProjects();
  return list.filter((p) => p.featured);
}

export async function addProject(project: Omit<Project, "order">) {
  const list = await readProjects();
  const minOrder = list.length ? Math.min(...list.map((p) => p.order ?? 0)) : 0;
  // New uploads appear first by default; reorder them from /admin afterward.
  const withOrder: Project = { ...project, order: minOrder - 1 };
  list.unshift(withOrder);
  await writeProjects(list);
  return withOrder;
}

/**
 * Updates a project's metadata only — never the video/thumbnail files or the
 * slug (which is also its URL), so existing links to /work/[slug] keep working.
 */
export async function updateProject(
  slug: string,
  patch: Partial<
    Pick<
      Project,
      "title" | "client" | "category" | "role" | "year" | "summary" | "featured"
    >
  >
) {
  const list = await readProjects();
  const index = list.findIndex((p) => p.slug === slug);
  if (index === -1) return null;

  list[index] = { ...list[index], ...patch };
  await writeProjects(list);
  return list[index];
}

/**
 * Points a project at a newly captured thumbnail file. Kept separate from
 * updateProject() because that function only ever touches editable metadata
 * — posterPath is tied to what's actually on disk, set by the upload/
 * thumbnail routes, not by the admin edit form.
 */
export async function setProjectPoster(slug: string, posterPath: string) {
  const list = await readProjects();
  const target = list.find((p) => p.slug === slug);
  if (!target) return null;
  target.posterPath = posterPath;
  await writeProjects(list);
  return target;
}

/** Applies a new manual display order given the full, ordered list of slugs. */
export async function reorderProjects(orderedSlugs: string[]) {
  const list = await readProjects();
  const position = new Map(orderedSlugs.map((slug, i) => [slug, i]));
  for (const p of list) {
    const i = position.get(p.slug);
    if (i !== undefined) p.order = i;
  }
  await writeProjects(list);
  return readProjects();
}

export async function deleteProject(slug: string) {
  const list = await readProjects();
  const target = list.find((p) => p.slug === slug);
  const next = list.filter((p) => p.slug !== slug);
  await writeProjects(next);
  return target;
}

export function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "project"
  );
}
