import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { deleteProject, updateProject, type Category } from "@/lib/store";
import { UPLOAD_DIR } from "@/lib/media-storage";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const project = await updateProject(slug, {
    title,
    client: String(body.client ?? "").trim(),
    category: String(body.category ?? "").trim() as Category,
    year: Number(body.year) || new Date().getFullYear(),
    summary: String(body.summary ?? "").trim(),
    featured: Boolean(body.featured),
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const project = await deleteProject(slug);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  for (const p of [project.videoPath, project.previewPath, project.posterPath]) {
    const relative = p.replace(/^\/media\//, "");
    const filePath = path.join(UPLOAD_DIR, relative);
    await fs.rm(filePath, { force: true });
  }

  return NextResponse.json({ ok: true });
}
