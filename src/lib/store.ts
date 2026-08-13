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

export async function readProjects(): Promise<Project[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  const list: Project[] = JSON.parse(raw);
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

async function writeProjects(list: Project[]) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
}

export async function getProject(slug: string) {
  const list = await readProjects();
  return list.find((p) => p.slug === slug);
}

export async function getFeatured() {
  const list = await readProjects();
  return list.filter((p) => p.featured);
}

export async function addProject(project: Project) {
  const list = await readProjects();
  list.unshift(project);
  await writeProjects(list);
  return project;
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
